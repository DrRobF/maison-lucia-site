const { randomUUID } = require('node:crypto');
const { fail, text } = require('./portal-model');

// Live credentials are separate; the existing sandbox settings stay intact.
function paymentMode(env = process.env) {
  const mode = env.STRIPE_MODE || 'test';
  if (!['test','live'].includes(mode)) fail('Stripe payment mode must be test or live.',503);
  return mode;
}
function credentialNames(mode) {
  return mode === 'live' ? {key:'STRIPE_LIVE_SECRET_KEY',secret:'STRIPE_LIVE_WEBHOOK_SECRET'} : {key:'STRIPE_SECRET_KEY',secret:'STRIPE_WEBHOOK_SECRET'};
}
function paymentReady(env = process.env, mode) {
  try {
    mode = mode || paymentMode(env);
    const names = credentialNames(mode);
    return new RegExp(`^(rk|sk)_${mode}_`).test((env[names.key] || '').trim()) && /^whsec_/.test((env[names.secret] || '').trim());
  } catch { return false; }
}
function stripeClient(env = process.env, mode = paymentMode(env)) {
  if (!paymentReady(env,mode)) fail(`${mode === 'live' ? 'Live' : 'Test'} card payments are awaiting Stripe connection setup.`,503);
  const Stripe = require('stripe');
  return new Stripe(env[credentialNames(mode).key].trim(),{apiVersion:'2026-08-26.dahlia',maxNetworkRetries:2,timeout:15000});
}
function signingSecret(env = process.env, mode = paymentMode(env)) {
  return (env[credentialNames(mode).secret] || '').trim();
}
function schedule(input, total) {
  const raw = String(input.deposit || '');
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) fail('Enter the deposit in dollars, with up to two decimal places.');
  const deposit = Math.round(Number(raw) * 100);
  if (!Number.isSafeInteger(deposit) || deposit < 50 || deposit > total || (deposit < total && total - deposit < 50)) fail('Each card payment must be at least $0.50, and the deposit cannot exceed the approved total.');
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  if (!validDate(input.depositDue) || input.depositDue < new Date().toISOString().slice(0,10) || (deposit < total && (!validDate(input.balanceDue) || input.balanceDue < input.depositDue))) fail('Choose valid due dates; the balance cannot be due before the deposit.');
  if (deposit > 99999999 || total - deposit > 99999999) fail('Each Stripe invoice must be under $1,000,000.');
  return [{ kind: 'deposit', amount: deposit, due: input.depositDue }, ...(deposit < total ? [{ kind: 'balance', amount: total - deposit, due: input.balanceDue }] : [])];
}
async function paymentData(db, projectId, admin = false, env = process.env) {
  const mode = paymentMode(env);
  const plan = (await db.query('SELECT proposal_id,total_cents,created_at,livemode FROM ml_payment_plans WHERE project_id=$1',[projectId])).rows[0] || null;
  const rows = (await db.query(`SELECT id,kind,amount_cents,due_date,stripe_status,published,amount_paid,amount_remaining,review_required,livemode,
    CASE WHEN published THEN hosted_url ELSE NULL END AS hosted_url,
    CASE WHEN published THEN pdf_url ELSE NULL END AS pdf_url
    FROM ml_payment_installments WHERE project_id=$1 ORDER BY CASE WHEN kind='deposit' THEN 0 ELSE 1 END`,[projectId])).rows;
  const standalone = (await db.query(`SELECT id,email_sent,description,amount_cents,due_date,stripe_status,published,amount_paid,amount_remaining,review_required,livemode,
    CASE WHEN published THEN hosted_url ELSE NULL END AS hosted_url, CASE WHEN published THEN pdf_url ELSE NULL END AS pdf_url
    FROM ml_standalone_invoices WHERE project_id=$1 ORDER BY created_at DESC,id`,[projectId])).rows;
  const archived = Boolean(plan && plan.livemode !== (mode === 'live'));
  return { standalone, activeLive:mode === 'live', connectionReady:paymentReady(env), plan, installments: rows, testMode: plan ? !plan.livemode : mode !== 'live', archived, ready: !archived && paymentReady(env), taxStatus:'not_configured' };
}
async function createPlan(db, project, input, env = process.env) {
  const live = paymentMode(env) === 'live';
  if (live && project.survey.testFixture) fail('Sandbox test events cannot create real invoices. Select a real client event.',409);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[`ml-payments:${project.id}`]);
    await client.query('SELECT id FROM ml_projects WHERE id=$1 FOR UPDATE',[project.id]);
    const existing = (await client.query('SELECT project_id,livemode FROM ml_payment_plans WHERE project_id=$1',[project.id])).rows[0];
    if (existing && existing.livemode !== live) fail('This event has payment records in a different Stripe mode. They cannot be converted into live charges.',409);
    if ((await client.query('SELECT id FROM ml_payment_installments WHERE project_id=$1 AND stripe_invoice_id IS NOT NULL',[project.id])).rows.length) fail('Stripe invoices already exist for this schedule. Review them in Stripe before making changes.',409);
    // Only the most recent approved proposal can start a payment schedule.
    const proposal = (await client.query("SELECT * FROM ml_proposals WHERE project_id=$1 AND status='Approved' ORDER BY version DESC LIMIT 1",[project.id])).rows[0];
    if (live && proposal?.details?.sandboxFixture) fail('A synthetic test proposal cannot be used for real payments.',409);
    if (!proposal || proposal.id !== input.proposalId) fail('Choose the latest approved proposal before preparing payments.',409);
    const parts = schedule(input, proposal.details.totalCents);
    if (existing) {
      await client.query('DELETE FROM ml_payment_installments WHERE project_id=$1',[project.id]);
      await client.query('UPDATE ml_payment_plans SET proposal_id=$1,total_cents=$2 WHERE project_id=$3',[proposal.id,proposal.details.totalCents,project.id]);
    } else await client.query('INSERT INTO ml_payment_plans(project_id,proposal_id,total_cents,livemode) VALUES($1,$2,$3,$4)',[project.id,proposal.id,proposal.details.totalCents,live]);
    for (const part of parts) await client.query('INSERT INTO ml_payment_installments(id,project_id,kind,amount_cents,due_date,amount_remaining,livemode) VALUES($1,$2,$3,$4,$5,$4,$6)',[randomUUID(),project.id,part.kind,part.amount,part.due,live]);
    await client.query('COMMIT');
  } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
async function createStandalone(db, project, input, env = process.env) {
  const live = paymentMode(env) === 'live';
  if (live && project.survey.testFixture) fail('Sandbox test events cannot create real invoices.',409);
  const description = text(input.description || '',500);
  if (!description) fail('Enter an invoice description.');
  const raw = String(input.amount || '');
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) fail('Enter the invoice amount in dollars, with up to two decimal places.');
  const amount = Math.round(Number(raw)*100);
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 99999999) fail('Invoice amount must be between $0.50 and $999,999.99.');
  // Reuse the schedule date validation without requiring any proposal.
  schedule({deposit:raw,depositDue:input.dueDate},amount);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId || '')) fail('Refresh and try creating the invoice again.');
  const result = await db.query(`INSERT INTO ml_standalone_invoices(id,project_id,description,amount_cents,due_date,amount_remaining,livemode)
    VALUES($1,$2,$3,$4,$5,$4,$6) ON CONFLICT(id) DO NOTHING RETURNING id`,[input.requestId,project.id,description,amount,input.dueDate,live]);
  if (!result.rows.length) {
    const previous = (await db.query('SELECT * FROM ml_standalone_invoices WHERE id=$1 AND project_id=$2',[input.requestId,project.id])).rows[0];
    if (!previous || previous.description !== description || previous.amount_cents !== amount || previous.livemode !== live || String(previous.due_date instanceof Date ? previous.due_date.toISOString() : previous.due_date).slice(0,10) !== input.dueDate) fail('This invoice request has changed. Refresh and try again.',409);
  }
  return {ok:true};
}
function invoiceTable(row) { return row.standalone ? 'ml_standalone_invoices' : 'ml_payment_installments'; }
function safeStripeUrl(value, kind) {
  if (!value) return null;
  try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === (kind === 'pdf' ? 'pay.stripe.com' : 'invoice.stripe.com') ? value : null; } catch { return null; }
}
async function storeInvoice(db, row, invoice) {
  if (invoice.livemode !== row.livemode || invoice.id !== row.stripe_invoice_id || invoice.currency !== 'usd' || invoice.subtotal !== row.amount_cents || invoice.total !== row.amount_cents) fail('The Stripe invoice does not match this payment schedule or Stripe mode.',409);
  await db.query(`UPDATE ${invoiceTable(row)} SET stripe_status=$1,hosted_url=$2,pdf_url=$3,amount_paid=$4,amount_remaining=$5,updated_at=now() WHERE id=$6`,
    [invoice.status,safeStripeUrl(invoice.hosted_invoice_url),safeStripeUrl(invoice.invoice_pdf,'pdf'),invoice.amount_paid,invoice.amount_remaining,row.id]);
}
async function manageInvoice(db, project, input, action, stripe, env = process.env) {
  const mode = paymentMode(env), live = mode === 'live';
  // Serialize all operations for this project, including network retries. Persist
  // Stripe IDs before later operations, so uncertain responses cannot double bill.
  const client = await db.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))',[`ml-payments:${project.id}`]);
    const standalone = input.standalone === true;
    const row = (await client.query(`SELECT * FROM ${standalone ? 'ml_standalone_invoices' : 'ml_payment_installments'} WHERE id=$1 AND project_id=$2`,[input.installmentId,project.id])).rows[0];
    if (row) row.standalone = standalone;
    const plan = standalone ? row : (await client.query('SELECT * FROM ml_payment_plans WHERE project_id=$1',[project.id])).rows[0];
    if (!plan || !row) fail('Payment installment not found.',404);
    if (plan.livemode !== live || row.livemode !== live) fail('This payment belongs to a different Stripe mode and cannot be charged here.',409);
    if (live && project.survey.testFixture) fail('Sandbox test events cannot create real invoices.',409);
    stripe = stripe || stripeClient(env,mode);
    const key = suffix => ({ idempotencyKey: `ml-${mode}-${row.id}-${suffix}` });
    if (action === 'payment-prepare') {
      if (!plan.customer_id) {
        const customer = await stripe.customers.create({ name: project.survey.name, email: project.survey.email, metadata: { ml_project_id: project.id } }, { idempotencyKey: `ml-${mode}-customer-${project.id}` });
        if (customer.livemode !== live) fail('Stripe customer mode does not match this payment schedule.',409);
        plan.customer_id = customer.id;
        await client.query(`UPDATE ${standalone ? 'ml_standalone_invoices' : 'ml_payment_plans'} SET customer_id=$1 WHERE ${standalone ? 'id' : 'project_id'}=$2`,[customer.id,standalone ? row.id : project.id]);
      }
      if (!row.stripe_invoice_id) {
        const due = Math.floor(new Date(`${(row.due_date instanceof Date ? row.due_date.toISOString().slice(0,10) : String(row.due_date).slice(0,10))}T23:59:59Z`).getTime()/1000);
        if (!Number.isFinite(due) || due <= Math.floor(Date.now()/1000)) fail('This due date has passed. Prepare a schedule with future due dates.');
        const invoice = await stripe.invoices.create({ customer: plan.customer_id, collection_method: 'send_invoice', due_date: due, auto_advance: false,
          pending_invoice_items_behavior: 'exclude', automatic_tax: { enabled: false },
          description: standalone ? row.description : `${row.kind === 'deposit' ? 'Deposit' : 'Final balance'} — ${project.survey.eventTitle}`,
          metadata: { ml_project_id: project.id, ...(standalone ? {} : {ml_proposal_id:plan.proposal_id}), ml_installment_id: row.id } }, key('invoice'));
        if (invoice.livemode !== live) fail('Stripe invoice mode does not match this payment schedule.',409);
        row.stripe_invoice_id = invoice.id;
        await client.query(`UPDATE ${invoiceTable(row)} SET stripe_invoice_id=$1,stripe_status='draft' WHERE id=$2`,[invoice.id,row.id]);
      }
      // Always retry the line item with the same key after an interrupted prepare.
      const current = await stripe.invoices.retrieve(row.stripe_invoice_id);
      if (current.status === 'draft') {
        const existing = await stripe.invoices.listLineItems(row.stripe_invoice_id,{limit:2});
        if (!existing.data.length) await stripe.invoiceItems.create({ customer: plan.customer_id, invoice: row.stripe_invoice_id, currency: 'usd', amount: row.amount_cents,
          description: standalone ? row.description : `${row.kind === 'deposit' ? 'Deposit' : 'Remaining balance'} for ${project.survey.eventTitle}` },key('item'));
      }
    }
    if (!row.stripe_invoice_id) fail('Prepare the draft invoice first.',409);
    let invoice = await stripe.invoices.retrieve(row.stripe_invoice_id);
    // Verify BEFORE making an invoice payable, including any Dashboard edits.
    await storeInvoice(client,row,invoice);
    if (action === 'payment-publish') {
      if (live && input.confirmLive !== true) fail('Review and confirm the real invoice before publishing it.',400);
      if (invoice.status === 'draft') invoice = await stripe.invoices.finalizeInvoice(invoice.id,{auto_advance:false},key('finalize'));
      if (!['open','paid'].includes(invoice.status)) fail('This invoice cannot be published.',409);
      await storeInvoice(client,row,invoice);
      await client.query(`UPDATE ${invoiceTable(row)} SET published=true WHERE id=$1`,[row.id]);
    }
    if (action === 'invoice-email') {
      if (!standalone || !row.published || invoice.status !== 'open') fail('Publish this invoice before emailing its payment link.',409);
      if (!row.email_sent) {
        await stripe.invoices.sendInvoice(invoice.id,{},key('email'));
        await client.query('UPDATE ml_standalone_invoices SET email_sent=true WHERE id=$1',[row.id]);
      }
    }
    return { ok: true };
  } finally {
    try { await client.query('SELECT pg_advisory_unlock(hashtext($1))',[`ml-payments:${project.id}`]); } finally { client.release(); }
  }
}
async function reconcileEvent(db, event, stripe) {
  if (typeof event.livemode !== 'boolean') fail('Stripe event mode is missing.',400);
  stripe = stripe || stripeClient(process.env,event.livemode ? 'live' : 'test');
  const relevant = event.type.startsWith('invoice.') || event.type === 'invoice_payment.paid' || event.type === 'charge.refunded' || event.type.startsWith('credit_note.');
  if (!relevant) return;
  const object = event.data.object;
  const invoiceId = object.object === 'invoice' ? object.id : (typeof object.invoice === 'string' ? object.invoice : object.invoice?.id);
  // Newer refund events may not carry invoice; refresh tracked paid invoices.
  const rows = [];
  for (const standalone of [false,true]) {
    const table = standalone ? 'ml_standalone_invoices' : 'ml_payment_installments';
    const found = invoiceId ? (await db.query(`SELECT * FROM ${table} WHERE stripe_invoice_id=$1 AND livemode=$2`,[invoiceId,event.livemode])).rows :
      event.type === 'charge.refunded' ? (await db.query(`SELECT * FROM ${table} WHERE stripe_status='paid' AND stripe_invoice_id IS NOT NULL AND livemode=$1`,[event.livemode])).rows : [];
    rows.push(...found.map(row=>({...row,standalone})));
  }
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query('INSERT INTO ml_stripe_events(id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id',[event.id]);
    if (inserted.rows.length) for (const row of rows) {
      await client.query(`SELECT id FROM ${invoiceTable(row)} WHERE id=$1 FOR UPDATE`,[row.id]);
      // Read current state rather than applying a possibly old event snapshot.
      const invoice = await stripe.invoices.retrieve(row.stripe_invoice_id,{expand:['payments']});
      await storeInvoice(client,row,invoice);
      const affected = event.type !== 'charge.refunded' || invoice.payments?.data?.some(p => (typeof p.payment?.payment_intent === 'string' ? p.payment.payment_intent : p.payment?.payment_intent?.id) === object.payment_intent || (typeof p.payment?.charge === 'string' ? p.payment.charge : p.payment?.charge?.id) === object.id);
      if ((event.type === 'charge.refunded' && affected) || event.type.startsWith('credit_note.')) await client.query(`UPDATE ${invoiceTable(row)} SET review_required=true WHERE id=$1`,[row.id]);
    }
    await client.query('COMMIT');
  } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
module.exports = { paymentMode,signingSecret,paymentReady,stripeClient,schedule,paymentData,createPlan,createStandalone,manageInvoice,reconcileEvent,safeStripeUrl,storeInvoice };
