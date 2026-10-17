import {useState} from 'react';
import styles from '../styles/Portal.module.css';

export function PaymentOptionsSettings({options,admin,busy,send}) {
  const [draft,setDraft]=useState(options);
  if (!admin || !options) return null;
  const edit=(key,value)=>setDraft({...draft,[key]:value});
  return <details className={styles.card}>
    <summary>Payment options for this client</summary>
    <p>Online payments accept credit and debit cards through Stripe. US bank account (ACH) payments appear once enabled in Stripe. No card surcharge is currently added.</p>
    <p><a href="https://dashboard.stripe.com/settings/billing/invoice" target="_blank" rel="noopener noreferrer">Open Stripe invoice payment settings</a></p>
    <form className={styles.form} onSubmit={event=>{event.preventDefault();send('payment-options',{options:draft});}}>
      <label className={styles.check}><input type="checkbox" checked={draft.checkEnabled} onChange={event=>edit('checkEnabled',event.target.checked)} />Offer payment by check</label>
      {draft.checkEnabled && <label>Check instructions<textarea required rows={3} maxLength={2000} value={draft.checkInstructions} onChange={event=>edit('checkInstructions',event.target.value)} /></label>}
      <label className={styles.check}><input type="checkbox" checked={draft.bankTransferEnabled} onChange={event=>edit('bankTransferEnabled',event.target.checked)} />Offer bank transfer or wire by arrangement</label>
      {draft.bankTransferEnabled && <label>Bank transfer instructions<textarea required rows={3} maxLength={2000} value={draft.bankTransferInstructions} onChange={event=>edit('bankTransferInstructions',event.target.value)} /></label>}
      <button className={styles.primary} disabled={busy}>Save payment options</button>
    </form>
    <p>These instructions are visible only inside this client's private portal. Choosing a payment option does not mark an invoice paid.</p>
    <p>After an offline payment clears, record it against the invoice in Stripe and refresh its payment status here. Check for any online payment already in progress before recording an offline payment.</p>
  </details>;
}

export default function PaymentChoices({row,options,onConversation,testMode=false,label='invoice'}) {
  const [choice,setChoice]=useState('online');
  return <div className={styles.paymentChoices}>
    <p><strong>Choose how to pay</strong></p>
    <div className={styles.actions}>
      <button type="button" aria-pressed={choice==='online'} onClick={()=>setChoice('online')}>Credit / debit card or online bank payment</button>
      {options?.checkEnabled && <button type="button" aria-pressed={choice==='check'} onClick={()=>setChoice('check')}>Pay by check</button>}
      {options?.bankTransferEnabled && <button type="button" aria-pressed={choice==='bank'} onClick={()=>setChoice('bank')}>Arrange bank transfer / wire</button>}
    </div>
    {choice==='online' ? <>
      <p>Credit and debit cards are accepted. If available, choose “US bank account” on Stripe's payment page to pay by bank account. Bank payments can take several business days; your invoice updates after payment is confirmed.</p>
      <a className={styles.payButton} href={row.hosted_url} target="_blank" rel="noopener noreferrer">Pay {label} securely{testMode ? ' (test)' : ''}</a>
    </> : <>
      <p className={styles.pre}>{choice==='check' ? options.checkInstructions : options.bankTransferInstructions}</p>
      {choice==='bank' && <p>Your bank may charge a transfer or wire fee.</p>}
      <p>Your invoice stays unpaid until Maison Lucia confirms receipt. Please avoid paying online as well if you have already sent a check or bank transfer.</p>
      {onConversation && <button type="button" onClick={onConversation}>Open Conversation</button>}
    </>}
  </div>;
}
