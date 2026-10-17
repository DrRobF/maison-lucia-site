import { useState } from 'react';
import styles from '../styles/Portal.module.css';
import PaymentChoices from './PaymentChoices';
const money = cents => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const date = value => String(value || '').slice(0,10);
export default function StandaloneInvoices({payments,admin,busy,send,onConversation}) {
  const [creating,setCreating] = useState(false);
  const [description,setDescription] = useState(''), [amount,setAmount] = useState(''), [dueDate,setDueDate] = useState('');
  const [requestId,setRequestId] = useState('');
  const rows = payments?.standalone || [];
  const activeLive = payments?.activeLive === true;
  if (!admin && !rows.length) return null;
  const act = (action,row,extra={}) => send(action,{installmentId:row.id,standalone:true,...extra});
  return <section className={styles.card} aria-label="Standalone invoices">
    <h2>Invoices</h2>
    {admin && <>
      <p>Create an invoice for this client whenever you need one. A proposal, contract, or signature is not required.</p>
      <button className={styles.primary} disabled={busy || creating} onClick={()=>{setRequestId(crypto.randomUUID());setCreating(true);}}>Create invoice</button>
      {creating && <form className={styles.form} onSubmit={async event=>{
        event.preventDefault();
        if (await send('invoice-create',{description,amount,dueDate,requestId})) {setCreating(false);setDescription('');setAmount('');setDueDate('');}
      }}>
        <label>Description<textarea required maxLength={500} rows={2} value={description} onChange={event=>setDescription(event.target.value)} /></label>
        <div className={styles.grid}>
          <label>Invoice amount ($)<input type="number" required min="0.50" max="999999.99" step="0.01" value={amount} onChange={event=>setAmount(event.target.value)} /></label>
          <label>Due date<input type="date" required min={new Date().toLocaleDateString('en-CA')} value={dueDate} onChange={event=>setDueDate(event.target.value)} /></label>
        </div>
        <p>{activeLive ? 'Live invoice' : 'Test invoice'} · Automatic tax is not configured. Confirm the tax treatment and invoice total before publishing.</p>
        <div className={styles.actions}><button className={styles.primary} disabled={busy}>Save draft</button><button type="button" disabled={busy} onClick={()=>setCreating(false)}>Cancel</button></div>
      </form>}
    </>}
    {!rows.length && <p>No standalone invoices yet.</p>}
    {rows.map(row=>{
      const historical = row.livemode !== activeLive;
      const ready = !historical && payments?.connectionReady;
      return <div className={styles.installment} key={row.id}>
        <h3>{row.description} · {money(row.amount_cents)}</h3>
        <p>Due {date(row.due_date)} · {!row.published && !admin ? 'Scheduled' : row.stripe_status === 'not_created' || row.stripe_status === 'draft' ? 'Draft' : row.stripe_status === 'open' ? 'Awaiting payment' : row.stripe_status === 'paid' ? 'Paid' : row.stripe_status}{!row.livemode ? ' · Test invoice' : ''}</p>
        {historical && <p>Historical {row.livemode ? 'live' : 'sandbox'} invoice — read-only in the current mode.</p>}
        {row.published && <p>Paid: {money(row.amount_paid)} · Remaining: {money(row.amount_remaining)}</p>}
        {row.review_required && <p className={styles.notice}>A refund or credit requires review in Stripe. Amount paid shows the original payment.</p>}
        <div className={styles.actions}>
          {admin && row.stripe_status === 'not_created' && <button disabled={busy || !ready} onClick={()=>act('payment-prepare',row)}>{busy ? 'Working…' : 'Prepare Stripe invoice'}</button>}
          {admin && !row.published && ['draft','open'].includes(row.stripe_status) && <button className={styles.primary} disabled={busy || !ready} onClick={()=>{if (!activeLive || window.confirm(`Publish a real ${money(row.amount_cents)} invoice for ${row.description}? Confirm the amount, due date and applicable taxes.`)) act('payment-publish',row,{confirmLive:activeLive});}}>Publish payment link</button>}
          {row.published && row.stripe_status === 'open' && row.hosted_url && ready && <PaymentChoices row={row} options={payments.options} onConversation={onConversation} testMode={!row.livemode} />}
          {admin && row.published && row.stripe_status === 'open' && <button disabled={busy || !ready || row.email_sent} onClick={()=>{if(window.confirm('Email this invoice and payment link to this client using Stripe?')) act('invoice-email',row);}}>{row.email_sent ? 'Invoice emailed' : 'Email invoice to client'}</button>}
          {row.published && row.stripe_status === 'paid' && row.hosted_url && <a href={row.hosted_url} target="_blank" rel="noopener noreferrer">View paid invoice</a>}
          {row.pdf_url && <a href={row.pdf_url} target="_blank" rel="noopener noreferrer">Download invoice PDF</a>}
          {admin && row.stripe_invoice_id && !historical && <a href={`https://dashboard.stripe.com/${row.livemode ? '' : 'test/'}invoices/${row.stripe_invoice_id}`} target="_blank" rel="noopener noreferrer">Open invoice in Stripe</a>}
          {admin && row.stripe_status !== 'not_created' && <button disabled={busy || !ready} onClick={()=>act('payment-refresh',row)}>Refresh payment status</button>}
        </div>
      </div>;
    })}
    {admin && <p>Saving a draft or publishing a link does not email or charge the client. Use “Email invoice to client” when ready.</p>}
  </section>;
}
