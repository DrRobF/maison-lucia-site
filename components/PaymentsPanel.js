import { useState } from 'react';
import styles from '../styles/Portal.module.css';
import StandaloneInvoices from './StandaloneInvoices';
import PaymentChoices, {PaymentOptionsSettings} from './PaymentChoices';

const money = cents => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const date = value => String(value || '').slice(0,10);
export default function PaymentsPanel({ payments, proposal, admin, busy, send, onConversation }) {
  const [deposit,setDeposit] = useState(''), [depositDue,setDepositDue] = useState(''), [balanceDue,setBalanceDue] = useState('');
  const [review,setReview] = useState(false), [editing,setEditing] = useState(false);
  const plan = payments?.plan, rows = payments?.installments || [];
  const testMode = payments?.testMode !== false, archived = payments?.archived === true;
  const total = plan?.total_cents ?? proposal?.details.totalCents ?? 0;
  const depositCents = Math.round(Number(deposit)*100);
  const valid = Number.isSafeInteger(depositCents) && depositCents > 0 && depositCents <= total;
  const paid = rows.reduce((sum,row) => sum+row.amount_paid,0);
  return <><PaymentOptionsSettings options={payments?.options} admin={admin} busy={busy} send={send} /><StandaloneInvoices payments={payments} admin={admin} busy={busy} send={send} onConversation={onConversation} /><section className={styles.card} aria-label="Invoices and payments">
    <h2>Deposits & final balance</h2>
    {testMode ? <p className={styles.notice}><strong>Test mode — no real money is collected.</strong> Use test cards only.</p> : <p className={styles.notice}><strong>Secure online payments</strong> · Payments are processed by Stripe for Maison Lucia LLC.</p>}
    {archived && <p className={styles.notice}>These are historical sandbox payment records. They are read-only while the portal is in live mode and cannot be converted into real charges.</p>}
    {admin && !archived && !payments?.ready && <p>Payment connection awaiting setup. Maison Lucia can prepare the schedule now; payment links become available once the secure connection is configured.</p>}
    {admin && <p>Automatic tax is awaiting configuration. Proposal-linked invoices use the approved proposal total without automatically adding tax. Review applicable taxes and the agreed total before publishing.</p>}
    {!plan || editing ? admin && proposal ? <form className={styles.form} onSubmit={async event => { event.preventDefault(); if (await send('payment-plan',{proposalId:proposal.id,deposit,depositDue,balanceDue})) {setReview(false);setEditing(false);} }}>
      <p>Approved project total: <strong>{money(total)}</strong>. Enter a fixed deposit or choose a percentage.</p>
      <div className={styles.actions}>{[25,50].map(percent => <button type="button" key={percent} disabled={busy} onClick={() => {setDeposit((Math.round(total*percent/100)/100).toFixed(2));setReview(false);}}>Use {percent}% deposit</button>)}</div>
      <label>Deposit amount ($)<input type="number" min="0.50" max={total/100} step="0.01" required value={deposit} onChange={event => {setDeposit(event.target.value);setReview(false);}} /></label>
      <p>Remaining balance: <strong>{valid ? money(total-depositCents) : 'Enter a deposit amount'}</strong></p>
      <div className={styles.grid}><label>Deposit due<input type="date" required min={new Date().toLocaleDateString('en-CA')} value={depositDue} onChange={event => {setDepositDue(event.target.value);setReview(false);}} /></label>{depositCents < total && <label>Final balance due<input type="date" required min={depositDue} value={balanceDue} onChange={event => {setBalanceDue(event.target.value);setReview(false);}} /></label>}</div>
      <label className={styles.check}><input type="checkbox" required checked={review} onChange={event => setReview(event.target.checked)} />I have reviewed the amounts and dates. This links the payment schedule to approved proposal version {proposal.version}.</label>
      <button className={styles.primary} disabled={busy || !valid || !review}>Save payment schedule</button>
    </form> : <p>{proposal ? 'Maison Lucia will prepare your deposit and final-balance payment schedule here.' : admin ? 'Optional: approve a proposal to create a linked deposit and balance schedule. You can create an invoice above at any time.' : 'Any invoices from Maison Lucia will appear here.'}</p> : <>
      {admin && !archived && rows.every(row => row.stripe_status === 'not_created') && <button disabled={busy} onClick={() => {const first=rows.find(row => row.kind === 'deposit');setDeposit((first.amount_cents/100).toFixed(2));setDepositDue(date(first.due_date));setBalanceDue(date(rows.find(row => row.kind === 'balance')?.due_date));setReview(false);setEditing(true);}}>Edit amounts or dates</button>}
      <div className={styles.paymentSummary}><p>Approved total<strong>{money(total)}</strong></p><p>Payments recorded<strong>{money(paid)}</strong></p><p>Remaining scheduled<strong>{money(rows.reduce((sum,row) => sum+(['void','uncollectible'].includes(row.stripe_status) ? 0 : row.amount_remaining),0))}</strong></p></div>
      {rows.map(row => <div className={styles.installment} key={row.id}>
        <h3>{row.kind === 'deposit' ? 'Deposit' : 'Final balance'} · {money(row.amount_cents)}</h3>
        <p>Due {date(row.due_date)} · {row.stripe_status === 'not_created' || !row.published && !admin ? 'Scheduled' : row.stripe_status === 'draft' ? 'Draft — awaiting review' : row.stripe_status === 'open' && date(row.due_date) < new Date().toISOString().slice(0,10) ? 'Overdue' : row.stripe_status === 'paid' ? 'Paid' : row.stripe_status}</p>
        {row.review_required && <p className={styles.notice}>A refund or credit requires review in Stripe. The recorded payment above is the original payment, not the net amount retained.</p>}
        <div className={styles.actions}>
          {admin && row.stripe_status === 'not_created' && <button disabled={busy || !payments.ready} onClick={() => send('payment-prepare',{installmentId:row.id})}>{busy ? 'Working…' : testMode ? 'Prepare test invoice' : 'Prepare invoice'}</button>}
          {admin && row.stripe_status !== 'not_created' && !row.published && ['draft','open','paid'].includes(row.stripe_status) && <button className={styles.primary} disabled={busy || !payments.ready} onClick={() => { if (testMode || window.confirm(`Publish a real ${money(row.amount_cents)} invoice? Confirm the amount, due date and applicable taxes have been reviewed.`)) send('payment-publish',{installmentId:row.id,confirmLive:!testMode}); }}>{busy ? 'Working…' : testMode ? 'Publish test payment link' : 'Publish payment link'}</button>}
          {!archived && payments?.ready && row.published && row.stripe_status === 'open' && row.hosted_url && <PaymentChoices row={row} options={payments.options} onConversation={onConversation} testMode={testMode} label={row.kind === 'deposit' ? 'deposit' : 'final balance'} />}
          {row.published && row.hosted_url && row.stripe_status === 'paid' && <a href={row.hosted_url} target="_blank" rel="noopener noreferrer">View paid invoice</a>}
          {row.pdf_url && <a href={row.pdf_url} target="_blank" rel="noopener noreferrer">Download invoice PDF</a>}
          {admin && row.stripe_invoice_id && !archived && <a href={`https://dashboard.stripe.com/${row.livemode ? '' : 'test/'}invoices/${row.stripe_invoice_id}`} target="_blank" rel="noopener noreferrer">Open invoice in Stripe</a>}
          {admin && row.stripe_status !== 'not_created' && <button disabled={busy || !payments.ready} onClick={() => send('payment-refresh',{installmentId:row.id})}>Refresh payment status</button>}
        </div>
      </div>)}
      <p>Online payment details are entered securely on Stripe. Payment status updates automatically after Stripe confirms payment.</p>
      {admin && <p>Payment links are available inside this client portal. Publishing does not email or charge the client. Changes to an existing schedule, refunds, and credit notes require review before any replacement invoice is issued.</p>}
    </>}
  </section></>;
}
