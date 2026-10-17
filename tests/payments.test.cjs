const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { schedule,paymentReady,createPlan,paymentData,manageInvoice,reconcileEvent,safeStripeUrl } = require('../lib/portal-payments');

test('payment amounts, dates, test-only credentials and Stripe URLs are validated', () => {
  assert.deepEqual(schedule({deposit:'1500',depositDue:'2099-01-01',balanceDue:'2099-02-01'},500000).map(p=>p.amount),[150000,350000]);
  assert.equal(schedule({deposit:'5000',depositDue:'2099-01-01'},500000).length,1);
  for (const deposit of ['0','5001','-1','1.234','1e3','NaN','0.01','4999.99']) assert.throws(()=>schedule({deposit,depositDue:'2099-01-01',balanceDue:'2099-02-01'},500000));
  assert.throws(()=>schedule({deposit:'1',depositDue:'2099-02-31',balanceDue:'2099-03-01'},500));
  assert.throws(()=>schedule({deposit:'1',depositDue:'2099-02-01',balanceDue:'2099-01-01'},500));
  assert.equal(paymentReady({STRIPE_SECRET_KEY:'sk_live_fake',STRIPE_WEBHOOK_SECRET:'whsec_test'}),false);
  assert.equal(paymentReady({STRIPE_SECRET_KEY:'rk_test_fake',STRIPE_WEBHOOK_SECRET:'whsec_test'}),true);
  assert.equal(paymentReady({STRIPE_SECRET_KEY:'rk_test_fake'}),false);
  assert.equal(safeStripeUrl('javascript:alert(1)'),null);
  assert.equal(safeStripeUrl('https://invoice.stripe.com.evil.test/foo'),null);
  assert.equal(safeStripeUrl('https://invoice.stripe.com/i/test'), 'https://invoice.stripe.com/i/test');
});

test('deposit and balance workflow prevents duplicates, draft leaks, amount tampering and stale webhook state', async () => {
  const pg = new PGlite();
  await pg.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
  await pg.exec(fs.readFileSync('scripts/portal-schema.sql','utf8'));
  await pg.exec(fs.readFileSync('scripts/payments-schema.sql','utf8'));
  // PGlite is single-process; production PostgreSQL takes these advisory locks.
  const query = (sql,args) => sql.includes('pg_advisory_') ? Promise.resolve({rows:[]}) : pg.query(sql,args);
  const db = { query,connect:async()=>({query,release(){}}) };
  const project = {id:randomUUID(),survey:{name:'Test client',email:'test@example.com',eventTitle:'Test event'}};
  const proposalId = randomUUID();
  await query('INSERT INTO ml_projects(id,survey) VALUES($1,$2)',[project.id,project.survey]);
  await query("INSERT INTO ml_proposals(id,project_id,version,details,status) VALUES($1,$2,1,$3,'Approved')",[proposalId,project.id,{totalCents:500000}]);
  const input = {proposalId,deposit:'1500',depositDue:'2099-01-01',balanceDue:'2099-02-01'};
  await createPlan(db,project,input);
  let data = await paymentData(db,project.id,true);
  assert.equal(data.plan.total_cents,500000);
  assert.deepEqual(data.installments.map(r=>r.amount_cents),[150000,350000]);
  await createPlan(db,project,{...input,deposit:'2000'});
  data = await paymentData(db,project.id,true);
  assert.deepEqual(data.installments.map(r=>r.amount_cents),[200000,300000]);
  const security = await query("SELECT relrowsecurity,has_table_privilege('anon',oid,'SELECT') AS anon_read,has_table_privilege('authenticated',oid,'SELECT') AS user_read FROM pg_class WHERE relname IN ('ml_payment_plans','ml_payment_installments','ml_stripe_events')");
  assert.ok(security.rows.every(r=>r.relrowsecurity && !r.anon_read && !r.user_read));
  const invoices = new Map(), keys = new Map(); let invoiceCount=0,itemCount=0,finalizeCount=0,failItem=true;
  const stripe = { customers:{create:async()=>({id:'cus_test',livemode:false})}, invoices:{
    create:async(params,options)=>{assert.equal(params.auto_advance,false);assert.equal(params.automatic_tax.enabled,false);assert.equal(params.pending_invoice_items_behavior,'exclude');assert.ok(!params.payment_method_types);const invoice={id:`in_${++invoiceCount}`,livemode:false,currency:'usd',subtotal:0,total:0,status:'draft',amount_paid:0,amount_remaining:0,metadata:params.metadata,payments:{data:[]}};invoices.set(invoice.id,invoice);keys.set(options.idempotencyKey,invoice);return invoice;},
    retrieve:async id=>({...invoices.get(id)}),
    listLineItems:async id=>({data:invoices.get(id).subtotal ? [{id:'il_test'}] : []}),
    finalizeInvoice:async id=>{finalizeCount++;const inv=invoices.get(id);inv.status='open';inv.hosted_invoice_url='https://invoice.stripe.com/i/test';inv.invoice_pdf='https://pay.stripe.com/invoice/test/pdf';return {...inv};}
  },invoiceItems:{create:async(params,options)=>{if(failItem){failItem=false;throw new Error('Simulated network interruption');}if(!keys.has(options.idempotencyKey)){itemCount++;keys.set(options.idempotencyKey,params);const inv=invoices.get(params.invoice);inv.subtotal=inv.total=inv.amount_remaining=params.amount;}return {id:'ii_test'};}}};
  const deposit = data.installments[0], balance=data.installments[1];
  await assert.rejects(manageInvoice(db,project,{installmentId:deposit.id},'payment-prepare',stripe),/network/);
  await manageInvoice(db,project,{installmentId:deposit.id},'payment-prepare',stripe);
  await manageInvoice(db,project,{installmentId:deposit.id},'payment-prepare',stripe);
  assert.equal(invoiceCount,1); assert.equal(itemCount,1);
  await assert.rejects(createPlan(db,project,input),/already exist/);
  await assert.rejects(manageInvoice(db,{...project,id:randomUUID()},{installmentId:deposit.id},'payment-publish',stripe),/not found/);
  assert.equal((await paymentData(db,project.id)).installments[0].hosted_url,null);
  const inv=invoices.get('in_1');inv.total++;
  await assert.rejects(manageInvoice(db,project,{installmentId:deposit.id},'payment-publish',stripe),/does not match/);
  assert.equal(finalizeCount,0);inv.total--;
  await manageInvoice(db,project,{installmentId:deposit.id},'payment-publish',stripe);
  await manageInvoice(db,project,{installmentId:deposit.id},'payment-publish',stripe);
  assert.equal(finalizeCount,1);
  assert.equal((await paymentData(db,project.id)).installments[0].hosted_url,'https://invoice.stripe.com/i/test');
  await manageInvoice(db,project,{installmentId:balance.id},'payment-prepare',stripe);
  assert.equal(invoices.get('in_2').total,300000);
  assert.equal(invoices.get('in_1').total+invoices.get('in_2').total,500000);
  inv.status='paid';inv.amount_paid=inv.total;inv.amount_remaining=0;
  const event={id:'evt_paid',livemode:false,type:'invoice.paid',data:{object:{id:inv.id,object:'invoice',status:'paid'}}};
  await reconcileEvent(db,event,stripe);await reconcileEvent(db,event,stripe);
  await reconcileEvent(db,{...event,id:'evt_old',type:'invoice.finalized',data:{object:{...event.data.object,status:'open'}}},stripe);
  assert.equal((await paymentData(db,project.id)).installments[0].stripe_status,'paid');
  assert.equal((await query('SELECT count(*)::integer AS count FROM ml_stripe_events')).rows[0].count,2);
  await assert.rejects(reconcileEvent(db,{...event,livemode:true},stripe),/Live events/);
  inv.payments={data:[{payment:{payment_intent:'pi_test'}}]};
  await reconcileEvent(db,{id:'evt_refund',livemode:false,type:'charge.refunded',data:{object:{object:'charge',id:'ch_test',payment_intent:'pi_test'}}},stripe);
  assert.equal((await paymentData(db,project.id)).installments[0].review_required,true);
  await pg.close();
});

test('webhook verification requires an intact signed raw payload', () => {
  const stripe = new (require('stripe'))('sk_test_fake');
  const payload=JSON.stringify({id:'evt_test',livemode:false,type:'invoice.paid',data:{object:{id:'in_test'}}});
  const secret='whsec_test';
  const header=stripe.webhooks.generateTestHeaderString({payload,secret});
  assert.equal(stripe.webhooks.constructEvent(Buffer.from(payload),header,secret).id,'evt_test');
  assert.throws(()=>stripe.webhooks.constructEvent(Buffer.from(payload+' '),header,secret));
});
