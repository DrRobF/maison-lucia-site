const { randomUUID } = require('node:crypto');
const { fail } = require('./portal-model');

// Deliberately test-only. A live launch requires a separately reviewed change.
function paymentReady(env = process.env) {
  return /^(rk|sk)_test_/.test(env.STRIPE_SECRET_KEY || '') && /^whsec_/.test(env.STRIPE_WEBHOOK_SECRET || '');
}
function stripeClient(env = process.env) {
  if (!paymentReady(env)) fail('Test card payments are awaiting Stripe connection setup.', 503);
  const Stripe = require('stripe');
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-08-26.dahlia', maxNetworkRetries: 2, timeout: 15000 });
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
async function paymentData(db, projectId, admin = false) {
  const plan = (await db.query('SELECT proposal_id,total_cents,created_at FROM ml_payment_plans WHERE project_id=$1',[projectId])).rows[0] || null;
  const rows = (await db.query(`SELECT id,kind,amount_cents,due_date,stripe_status,published,amount_paid,amount_remaining,review_required,
    CASE WHEN published THEN hosted_url ELSE NULL END AS hosted_url,
    CASE WHEN published THEN pdf_url ELSE NULL END AS pdf_url
    FROM ml_payment_installments WHERE project_id=$1 ORDER BY CASE WHEN kind='deposit' THEN 0 ELSE 1 END`,[projectId])).rows;
  return { plan, installments: rows, testMode: true, ready: admin ? paymentReady() : undefined, taxStatus: 'not_configured' };
}
async function createPlan(db, project, input) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[`ml-payments:${project.id}`]);
    await client.query('SELECT id FROM ml_projects WHERE id=$1 FOR UPDATE',[project.id]);
    const existing = (await client.query('SELECT project_id FROM ml_payment_plans WHERE project_id=$1',[project.id])).rows.length;
    if ((await client.query('SELECT id FROM ml_payment_installments WHERE project_id=$1 AND stripe_invoice_id IS NOT NULL',[project.id])).rows.length) fail('Stripe invoices already exist for this schedule. Review them in Stripe before making changes.',409);
    // Only the most recent approved proposal can start a payment schedule.
    const proposal = (await client.query("SELECT * FROM ml_proposals WHERE project_id=$1 AND status='Approved' ORDER BY version DESC LIMIT 1",[project.id])).rows[0];
    if (!proposal || proposal.id !== input.proposalId) fail('Choose the latest approved proposal before preparing payments.',409);
    const parts = schedule(input, proposal.details.totalCents);
    if (existing) {
      await client.query('DELETE FROM ml_payment_installments WHERE project_id=$1',[project.id]);
      await client.query('UPDATE ml_payment_plans SET proposal_id=$1,total_cents=$2 WHERE project_id=$3',[proposal.id,proposal.details.totalCents,project.id]);
    } else await client.query('INSERT INTO ml_payment_plans(project_id,proposal_id,total_cents) VALUES($1,$2,$3)',[project.id,proposal.id,proposal.details.totalCents]);
    for (const part of parts) await client.query('INSERT INTO ml_payment_installments(id,project_id,kind,amount_cents,due_date,amount_remaining) VALUES($1,$2,$3,$4,$5,$4)',[randomUUID(),project.id,part.kind,part.amount,part.due]);
    await client.query('COMMIT');
  } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
function safeStripeUrl(value, kind) {
  if (!value) return null;
  try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === (kind === 'pdf' ? 'pay.stripe.com' : 'invoice.stripe.com') ? value : null; } catch { return null; }
}
async function storeInvoice(db, row, invoice) {
  if (invoice.livemode !== false || invoice.id !== row.stripe_invoice_id || invoice.currency !== 'usd' || invoice.subtotal !== row.amount_cents || invoice.total !== row.amount_cents) fail('The Stripe invoice does not match this test payment schedule.',409);
  await db.query(`UPDATE ml_payment_installments SET stripe_status=$1,hosted_url=$2,pdf_url=$3,amount_paid=$4,amount_remaining=$5,updated_at=now() WHERE id=$6`,
    [invoice.status,safeStripeUrl(invoice.hosted_invoice_url),safeStripeUrl(invoice.invoice_pdf,'pdf'),invoice.amount_paid,invoice.amount_remaining,row.id]);
}
async function manageInvoice(db, project, input, action, stripe = stripeClient()) {
  // Serialize all operations for this project, including network retries. Persist
  // Stripe IDs before later operations, so uncertain responses cannot double bill.
  const client = await db.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))',[`ml-payments:${project.id}`]);
    const plan = (await client.query('SELECT * FROM ml_payment_plans WHERE project_id=$1',[project.id])).rows[0];
    const row = (await client.query('SELECT * FROM ml_payment_installments WHERE id=$1 AND project_id=$2',[input.installmentId,project.id])).rows[0];
    if (!plan || !row) fail('Payment installment not found.',404);
    const key = suffix => ({ idempotencyKey: `ml-test-${row.id}-${suffix}` });
    if (action === 'payment-prepare') {
      if (!plan.customer_id) {
        const customer = await stripe.customers.create({ name: project.survey.name, email: project.survey.email, metadata: { ml_project_id: project.id } }, { idempotencyKey: `ml-test-customer-${project.id}` });
        if (customer.livemode !== false) fail('Only Stripe test customers are supported.',409);
        plan.customer_id = customer.id;
        await client.query('UPDATE ml_payment_plans SET customer_id=$1 WHERE project_id=$2',[customer.id,project.id]);
      }
      if (!row.stripe_invoice_id) {
        const due = Math.floor(new Date(`${(row.due_date instanceof Date ? row.due_date.toISOString().slice(0,10) : String(row.due_date).slice(0,10))}T23:59:59Z`).getTime()/1000);
        if (!Number.isFinite(due) || due <= Math.floor(Date.now()/1000)) fail('This due date has passed. Prepare a schedule with future due dates.');
        const invoice = await stripe.invoices.create({ customer: plan.customer_id, collection_method: 'send_invoice', due_date: due, auto_advance: false,
          pending_invoice_items_behavior: 'exclude', automatic_tax: { enabled: false },
          description: `${row.kind === 'deposit' ? 'Deposit' : 'Final balance'} — ${project.survey.eventTitle}`,
          metadata: { ml_project_id: project.id, ml_proposal_id: plan.proposal_id, ml_installment_id: row.id } }, key('invoice'));
        if (invoice.livemode !== false) fail('Only Stripe test invoices are supported.',409);
        row.stripe_invoice_id = invoice.id;
        await client.query("UPDATE ml_payment_installments SET stripe_invoice_id=$1,stripe_status='draft' WHERE id=$2",[invoice.id,row.id]);
      }
      // Always retry the line item with the same key after an interrupted prepare.
      const current = await stripe.invoices.retrieve(row.stripe_invoice_id);
      if (current.status === 'draft') {
        const existing = await stripe.invoices.listLineItems(row.stripe_invoice_id,{limit:2});
        if (!existing.data.length) await stripe.invoiceItems.create({ customer: plan.customer_id, invoice: row.stripe_invoice_id, currency: 'usd', amount: row.amount_cents,
          description: `${row.kind === 'deposit' ? 'Deposit' : 'Remaining balance'} for ${project.survey.eventTitle}` },key('item'));
      }
    }
    if (!row.stripe_invoice_id) fail('Prepare the draft invoice first.',409);
    let invoice = await stripe.invoices.retrieve(row.stripe_invoice_id);
    // Verify BEFORE making an invoice payable, including any Dashboard edits.
    await storeInvoice(client,row,invoice);
    if (action === 'payment-publish') {
      if (invoice.status === 'draft') invoice = await stripe.invoices.finalizeInvoice(invoice.id,{auto_advance:false},key('finalize'));
      if (!['open','paid'].includes(invoice.status)) fail('This invoice cannot be published.',409);
      await storeInvoice(client,row,invoice);
      await client.query('UPDATE ml_payment_installments SET published=true WHERE id=$1',[row.id]);
    }
    return { ok: true };
  } finally {
    try { await client.query('SELECT pg_advisory_unlock(hashtext($1))',[`ml-payments:${project.id}`]); } finally { client.release(); }
  }
}
async function reconcileEvent(db, event, stripe = stripeClient()) {
  if (event.livemode !== false) fail('Live events are not supported by this test integration.',400);
  const relevant = event.type.startsWith('invoice.') || event.type === 'charge.refunded' || event.type.startsWith('credit_note.');
  if (!relevant) return;
  const object = event.data.object;
  const invoiceId = object.object === 'invoice' ? object.id : (typeof object.invoice === 'string' ? object.invoice : object.invoice?.id);
  // Newer refund events may not carry invoice; refresh tracked paid invoices.
  const rows = invoiceId ? (await db.query('SELECT * FROM ml_payment_installments WHERE stripe_invoice_id=$1',[invoiceId])).rows :
    event.type === 'charge.refunded' ? (await db.query("SELECT * FROM ml_payment_installments WHERE stripe_status='paid' AND stripe_invoice_id IS NOT NULL")).rows : [];
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query('INSERT INTO ml_stripe_events(id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id',[event.id]);
    if (inserted.rows.length) for (const row of rows) {
      await client.query('SELECT id FROM ml_payment_installments WHERE id=$1 FOR UPDATE',[row.id]);
      // Read current state rather than applying a possibly old event snapshot.
      const invoice = await stripe.invoices.retrieve(row.stripe_invoice_id,{expand:['payments']});
      await storeInvoice(client,row,invoice);
      const affected = event.type !== 'charge.refunded' || invoice.payments?.data?.some(p => (typeof p.payment?.payment_intent === 'string' ? p.payment.payment_intent : p.payment?.payment_intent?.id) === object.payment_intent || (typeof p.payment?.charge === 'string' ? p.payment.charge : p.payment?.charge?.id) === object.id);
      if ((event.type === 'charge.refunded' && affected) || event.type.startsWith('credit_note.')) await client.query('UPDATE ml_payment_installments SET review_required=true WHERE id=$1',[row.id]);
    }
    await client.query('COMMIT');
  } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
module.exports = { paymentReady,stripeClient,schedule,paymentData,createPlan,manageInvoice,reconcileEvent,safeStripeUrl,storeInvoice };
