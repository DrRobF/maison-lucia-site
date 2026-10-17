const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { schedule,paymentReady,stripeClient,createPlan,paymentData,manageInvoice,reconcileEvent,safeStripeUrl } = require('../lib/portal-payments');

test('payment amounts, dates, test-only credentials and Stripe URLs are validated', () => {
  assert.deepEqual(schedule({deposit:'1500',depositDue:'2099-01-01',balanceDue:'2099-02-01'},500000).map(p=>p.amount),[150000,350000]);
  assert.equal(schedule({deposit:'5000',depositDue:'2099-01-01'},500000).length,1);
  for (const deposit of ['0','5001','-1','1.234','1e3','NaN','0.01','4999.99']) assert.throws(()=>schedule({deposit,depositDue:'2099-01-01',balanceDue:'2099-02-01'},500000));
  assert.throws(()=>schedule({deposit:'1',depositDue:'2099-02-31',balanceDue:'2099-03-01'},500));
  assert.throws(()=>schedule({deposit:'1',depositDue:'2099-02-01',balanceDue:'2099-01-01'},500));
  assert.equal(paymentReady({STRIPE_SECRET_KEY:'sk_live_fake',STRIPE_WEBHOOK_SECRET:'whsec_test'}),false);
  assert.equal(paymentReady({STRIPE_SECRET_KEY:'rk_test_fake',STRIPE_WEBHOOK_SECRET:'whsec_test'}),true);
  assert.equal(paymentReady({STRIPE_SECRET_KEY:'rk_test_fake'}),false);
  assert.equal(paymentReady({STRIPE_MODE:'live',STRIPE_LIVE_SECRET_KEY:'rk_live_fake',STRIPE_LIVE_WEBHOOK_SECRET:'whsec_live'}),true);
  assert.equal(paymentReady({STRIPE_MODE:'live',STRIPE_LIVE_SECRET_KEY:'rk_test_fake',STRIPE_LIVE_WEBHOOK_SECRET:'whsec_live'}),false);
  assert.equal(paymentReady({STRIPE_MODE:'live',STRIPE_SECRET_KEY:'rk_live_fake',STRIPE_WEBHOOK_SECRET:'whsec_live'}),false);
  assert.equal(paymentReady({STRIPE_MODE:'bad',STRIPE_SECRET_KEY:'rk_test_fake',STRIPE_WEBHOOK_SECRET:'whsec_test'}),false);
  assert.throws(()=>stripeClient({STRIPE_MODE:'live',STRIPE_SECRET_KEY:'rk_test_fake',STRIPE_WEBHOOK_SECRET:'whsec_test'}),/awaiting/);
  assert.equal(safeStripeUrl('javascript:alert(1)'),null);
  assert.equal(safeStripeUrl('https://invoice.stripe.com.evil.test/foo'),null);
  assert.equal(safeStripeUrl('https://invoice.stripe.com/i/test'), 'https://invoice.stripe.com/i/test');
});

for (const live of [false,true]) test(`${live ? 'live' : 'test'} deposit and balance workflow prevents duplicates, cross-mode access, amount tampering and stale events`, async () => {
  const env={STRIPE_MODE:live ? 'live' : 'test'};
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
  await createPlan(db,project,input,env);
  let data = await paymentData(db,project.id,true,env);
  assert.equal(data.plan.total_cents,500000);
  assert.deepEqual(data.installments.map(r=>r.amount_cents),[150000,350000]);
  await createPlan(db,project,{...input,deposit:'2000'},env);
  data = await paymentData(db,project.id,true,env);
  assert.deepEqual(data.installments.map(r=>r.amount_cents),[200000,300000]);
  const security = await query("SELECT relrowsecurity,has_table_privilege('anon',oid,'SELECT') AS anon_read,has_table_privilege('authenticated',oid,'SELECT') AS user_read FROM pg_class WHERE relname IN ('ml_payment_plans','ml_payment_installments','ml_stripe_events')");
  assert.ok(security.rows.every(r=>r.relrowsecurity && !r.anon_read && !r.user_read));
  const invoices = new Map(), keys = new Map(); let invoiceCount=0,itemCount=0,finalizeCount=0,failItem=true;
  const stripe = { customers:{create:async()=>({id:'cus_test',livemode:live})}, invoices:{
    create:async(params,options)=>{assert.equal(params.auto_advance,false);assert.equal(params.automatic_tax.enabled,false);assert.equal(params.pending_invoice_items_behavior,'exclude');assert.ok(!params.payment_method_types);const invoice={id:`in_${++invoiceCount}`,livemode:live,currency:'usd',subtotal:0,total:0,status:'draft',amount_paid:0,amount_remaining:0,metadata:params.metadata,payments:{data:[]}};invoices.set(invoice.id,invoice);keys.set(options.idempotencyKey,invoice);return invoice;},
    retrieve:async id=>({...invoices.get(id)}),
    listLineItems:async id=>({data:invoices.get(id).subtotal ? [{id:'il_test'}] : []}),
    finalizeInvoice:async id=>{finalizeCount++;const inv=invoices.get(id);inv.status='open';inv.hosted_invoice_url='https://invoice.stripe.com/i/test';inv.invoice_pdf='https://pay.stripe.com/invoice/test/pdf';return {...inv};}
  },invoiceItems:{create:async(params,options)=>{if(failItem){failItem=false;throw new Error('Simulated network interruption');}if(!keys.has(options.idempotencyKey)){itemCount++;keys.set(options.idempotencyKey,params);const inv=invoices.get(params.invoice);inv.subtotal=inv.total=inv.amount_remaining=params.amount;}return {id:'ii_test'};}}};
  const deposit = data.installments[0], balance=data.installments[1];
  await assert.rejects(manageInvoice(db,project,{installmentId:deposit.id,confirmLive:true},'payment-prepare',stripe,env),/network/);
  await manageInvoice(db,project,{installmentId:deposit.id,confirmLive:true},'payment-prepare',stripe,env);
  await manageInvoice(db,project,{installmentId:deposit.id,confirmLive:true},'payment-prepare',stripe,env);
  assert.equal(invoiceCount,1); assert.equal(itemCount,1);
  await assert.rejects(createPlan(db,project,input,env),/already exist/);
  await assert.rejects(manageInvoice(db,{...project,id:randomUUID()},{installmentId:deposit.id,confirmLive:true},'payment-publish',stripe,env),/not found/);
  assert.equal((await paymentData(db,project.id,false,env)).installments[0].hosted_url,null);
  if (live) { await assert.rejects(manageInvoice(db,project,{installmentId:deposit.id},'payment-publish',stripe,env),/Review and confirm/); assert.equal(finalizeCount,0); }
  const inv=invoices.get('in_1');inv.total++;
  await assert.rejects(manageInvoice(db,project,{installmentId:deposit.id,confirmLive:true},'payment-publish',stripe,env),/does not match/);
  assert.equal(finalizeCount,0);inv.total--;
  await manageInvoice(db,project,{installmentId:deposit.id,confirmLive:true},'payment-publish',stripe,env);
  await manageInvoice(db,project,{installmentId:deposit.id,confirmLive:true},'payment-publish',stripe,env);
  assert.equal(finalizeCount,1);
  assert.equal((await paymentData(db,project.id,false,env)).installments[0].hosted_url,'https://invoice.stripe.com/i/test');
  await manageInvoice(db,project,{installmentId:balance.id},'payment-prepare',stripe,env);
  assert.equal(invoices.get('in_2').total,300000);
  assert.equal(invoices.get('in_1').total+invoices.get('in_2').total,500000);
  inv.status='paid';inv.amount_paid=inv.total;inv.amount_remaining=0;
  const event={id:'evt_paid',livemode:live,type:'invoice.paid',data:{object:{id:inv.id,object:'invoice',status:'paid'}}};
  await reconcileEvent(db,event,stripe);await reconcileEvent(db,event,stripe);
  await reconcileEvent(db,{...event,id:'evt_old',type:'invoice.finalized',data:{object:{...event.data.object,status:'open'}}},stripe);
  assert.equal((await paymentData(db,project.id,false,env)).installments[0].stripe_status,'paid');
  assert.equal((await query('SELECT count(*)::integer AS count FROM ml_stripe_events')).rows[0].count,2);
  await reconcileEvent(db,{...event,livemode:!live},stripe);
  assert.equal((await paymentData(db,project.id,false,env)).installments[0].stripe_status,'paid');
  const archived=await paymentData(db,project.id,true,{STRIPE_MODE:live ? 'test' : 'live'});
  assert.equal(archived.archived,true);assert.equal(archived.ready,false);
  await assert.rejects(manageInvoice(db,project,{installmentId:deposit.id},'payment-prepare',stripe,{STRIPE_MODE:live ? 'test' : 'live'}),/different Stripe mode/);
  if (live) await assert.rejects(createPlan(db,{...project,survey:{...project.survey,testFixture:'seed'}},input,env),/Sandbox test/);
  inv.payments={data:[{payment:{payment_intent:'pi_test'}}]};
  await reconcileEvent(db,{id:'evt_refund',livemode:live,type:'charge.refunded',data:{object:{object:'charge',id:'ch_test',payment_intent:'pi_test'}}},stripe);
  assert.equal((await paymentData(db,project.id,false,env)).installments[0].review_required,true);
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

test('webhook endpoint verifies each event with its own live or test secret before processing', async () => {
  const vm = require('node:vm');
  const payments = require('../lib/portal-payments');
  const env = {STRIPE_MODE:'live',STRIPE_SECRET_KEY:'rk_test_fake',STRIPE_WEBHOOK_SECRET:'whsec_sandbox',STRIPE_LIVE_SECRET_KEY:'rk_live_fake',STRIPE_LIVE_WEBHOOK_SECRET:'whsec_production'};
  const received=[];
  const source=fs.readFileSync('pages/api/stripe/webhook.js','utf8').replace('export default async function handler','async function handler').replace(/export const config =[^\n]+/,'module.exports=handler;');
  const context={Buffer,JSON,console,process:{env},module:{exports:{}},require:name=>name.endsWith('portal-db') ? {database:()=>({})} : {...payments,reconcileEvent:async(db,event)=>received.push(event)}};
  vm.runInNewContext(source,context);
  const signer=new (require('stripe'))('sk_test_fake');
  async function deliver(live,secret) {
    const payload=JSON.stringify({id:live?'evt_live':'evt_test',type:'invoice.paid',livemode:live,data:{object:{id:'in_fixture'}}});
    let status=200;
    const req={method:'POST',headers:{'stripe-signature':signer.webhooks.generateTestHeaderString({payload,secret})},async *[Symbol.asyncIterator](){yield Buffer.from(payload);}};
    const res={setHeader(){},status(value){status=value;return this;},json(){return this;}};
    await context.module.exports(req,res);return status;
  }
  assert.equal(await deliver(false,'whsec_sandbox'),200);
  assert.equal(await deliver(true,'whsec_production'),200);
  assert.equal(await deliver(true,'whsec_sandbox'),400);
  assert.equal(received.length,2);
  assert.equal(received[0].livemode,false);assert.equal(received[1].livemode,true);
  env.STRIPE_LIVE_SECRET_KEY='rk_test_wrong_mode';
  assert.equal(await deliver(true,'whsec_production'),503);
  assert.equal(received.length,2);
});

for (const live of [false,true]) test(`${live ? 'live' : 'test'} standalone invoices need no proposal, preserve distinct amounts, and reconcile signed-event state`, async () => {
  const {createStandalone} = require('../lib/portal-payments');
  const pg = new PGlite();
  await pg.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
  await pg.exec(fs.readFileSync('scripts/portal-schema.sql','utf8'));
  await pg.exec(fs.readFileSync('scripts/payments-schema.sql','utf8'));
  const query = (sql,args) => sql.includes('pg_advisory_') ? Promise.resolve({rows:[]}) : pg.query(sql,args);
  const db = {query,connect:async()=>({query,release(){}})}, env={STRIPE_MODE:live?'live':'test'};
  const project={id:randomUUID(),survey:{name:'Invoice client',email:'client@example.com',eventTitle:''}};
  await query('INSERT INTO ml_projects(id,survey) VALUES($1,$2)',[project.id,project.survey]);
  const input={requestId:randomUUID(),description:'Additional event services',amount:'125.50',dueDate:'2099-01-01'};
  await createStandalone(db,project,input,env);await createStandalone(db,project,input,env);
  await assert.rejects(createStandalone(db,project,{...input,amount:'126'},env),/request has changed/);
  for (const amount of ['0','-1','1.001','1e3','1000000']) await assert.rejects(createStandalone(db,project,{...input,requestId:randomUUID(),amount},env));
  await assert.rejects(createStandalone(db,project,{...input,requestId:randomUUID(),description:''},env));
  await assert.rejects(createStandalone(db,project,{...input,requestId:randomUUID(),dueDate:'2099-02-31'},env));
  await createStandalone(db,project,{...input,requestId:randomUUID(),description:'Separate invoice',amount:'75'},env);
  let data=await paymentData(db,project.id,true,env);
  assert.equal(data.plan,null);assert.equal(data.standalone.length,2);
  assert.equal((await query('SELECT count(*)::int AS n FROM ml_proposals')).rows[0].n,0);
  const perms=(await query("SELECT relrowsecurity,has_table_privilege('anon',oid,'SELECT') AS anon_read,has_table_privilege('authenticated',oid,'SELECT') AS client_read FROM pg_class WHERE relname='ml_standalone_invoices'")).rows[0];
  assert.ok(perms.relrowsecurity && !perms.anon_read && !perms.client_read);
  const invoices=new Map();let created=0,emailed=0;
  const stripe={customers:{create:async()=>({id:'cus_standalone',livemode:live})},invoices:{
    create:async params=>{assert.equal(params.description,'Additional event services');assert.ok(!params.metadata.ml_proposal_id);assert.equal(params.auto_advance,false);const invoice={id:`in_standalone_${++created}`,livemode:live,currency:'usd',subtotal:0,total:0,amount_paid:0,amount_remaining:0,status:'draft'};invoices.set(invoice.id,invoice);return invoice;},
    retrieve:async id=>({...invoices.get(id)}),listLineItems:async id=>({data:invoices.get(id).total?[{}]:[]}),
    finalizeInvoice:async id=>{const invoice=invoices.get(id);invoice.status='open';invoice.hosted_invoice_url='https://invoice.stripe.com/i/standalone';return {...invoice};},
    sendInvoice:async()=>{emailed++;return {};}
  },invoiceItems:{create:async params=>{const invoice=invoices.get(params.invoice);invoice.total=invoice.subtotal=invoice.amount_remaining=params.amount;return {};}}};
  const action={installmentId:input.requestId,standalone:true,confirmLive:true};
  await assert.rejects(manageInvoice(db,{...project,id:randomUUID()},action,'payment-prepare',stripe,env),/not found/);
  await assert.rejects(manageInvoice(db,project,action,'payment-prepare',stripe,{STRIPE_MODE:live?'test':'live'}),/different Stripe mode/);
  await manageInvoice(db,project,action,'payment-prepare',stripe,env);
  await manageInvoice(db,project,action,'payment-prepare',stripe,env);
  assert.equal(created,1);assert.equal(invoices.get('in_standalone_1').total,12550);assert.equal(emailed,0);
  await assert.rejects(manageInvoice(db,project,action,'invoice-email',stripe,env),/Publish/);
  assert.equal((await paymentData(db,project.id,false,env)).standalone.find(r=>r.id===input.requestId).hosted_url,null);
  if(live) await assert.rejects(manageInvoice(db,project,{...action,confirmLive:false},'payment-publish',stripe,env),/Review and confirm/);
  await manageInvoice(db,project,action,'payment-publish',stripe,env);assert.equal(emailed,0);
  await manageInvoice(db,project,action,'invoice-email',stripe,env);
  await manageInvoice(db,project,action,'invoice-email',stripe,env);assert.equal(emailed,1);
  const invoice=invoices.get('in_standalone_1');invoice.status='paid';invoice.amount_paid=12550;invoice.amount_remaining=0;
  const event={id:`evt_standalone_${live}`,livemode:live,type:'invoice.paid',data:{object:{object:'invoice',id:invoice.id}}};
  await reconcileEvent(db,event,stripe);await reconcileEvent(db,event,stripe);
  data=await paymentData(db,project.id,false,env);const paid=data.standalone.find(r=>r.id===input.requestId);
  assert.equal(paid.stripe_invoice_id,null);
  assert.equal((await paymentData(db,project.id,true,env)).standalone.find(r=>r.id===input.requestId).stripe_invoice_id,'in_standalone_1');
  assert.equal(paid.stripe_status,'paid');assert.equal(paid.amount_paid,12550);assert.equal(paid.amount_remaining,0);
  assert.equal(data.standalone.find(r=>r.id!==input.requestId).stripe_status,'not_created');
  await reconcileEvent(db,{...event,id:`evt_credit_${live}`,type:'credit_note.created',data:{object:{object:'credit_note',invoice:invoice.id}}},stripe);
  assert.equal((await paymentData(db,project.id,true,env)).standalone.find(r=>r.id===input.requestId).review_required,true);
  if(live) await assert.rejects(createStandalone(db,{...project,survey:{...project.survey,testFixture:true}},{...input,requestId:randomUUID()},env),/Sandbox/);
  await pg.close();
});
