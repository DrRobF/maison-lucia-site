import { useEffect, useRef, useState } from 'react';
import { fields } from '../lib/portal-fields';
import { InspirationLinks, portalApi } from './PortalShell';
import styles from '../styles/Portal.module.css';
const groups = [{ title: 'You & your celebration', start: 0, end: 7 }, { title: 'The setting & scope', start: 7, end: 13 }, { title: 'Your design direction', start: 13, end: 21 }, { title: 'Details & inspiration', start: 21, end: fields.length }];
function initialDetails(survey) {
  return Object.fromEntries(fields.map(([key]) => [key, key === 'services' && survey.intakeSource === 'manager' && survey[key] === 'Details to be discussed in the portal.' ? '' : survey[key] || '']));
}
const sameEvent = (snapshot, survey) => fields.every(([key]) => (snapshot[key] || '') === (survey[key] || '')) && JSON.stringify(snapshot.images || []) === JSON.stringify(survey.images || []);
export default function EventDetails({ project, agreements = [], admin, send, busy, onSaved }) {
  const [draft, setDraft] = useState(() => initialDetails(project.survey));
  const draftRef = useRef(draft), baseRef = useRef(project), savingRef = useRef(false);
  const [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false), [saveError, setSaveError] = useState(''), [blocked, setBlocked] = useState(false), [mode, setMode] = useState(agreements.length ? 'Summary' : 'Form');
  const [signedName, setSignedName] = useState(''), [confirm, setConfirm] = useState(false), [agreementId, setAgreementId] = useState('');
  useEffect(() => {
    if (!dirty && !savingRef.current) { const next = initialDetails(project.survey); setDraft(next); draftRef.current = next; baseRef.current = project; }
  }, [project, dirty]);
  function edit(key, value) {
    const next = { ...draftRef.current, [key]: value }; draftRef.current = next; setDraft(next); setDirty(true); setSaveError(''); setBlocked(false);
  }
  async function save() {
    if (savingRef.current || !dirty || busy) return false;
    const captured = { ...draftRef.current }, base = baseRef.current, original = initialDetails(base.survey);
    const patch = Object.fromEntries(fields.filter(([key]) => captured[key] !== original[key]).map(([key]) => [key,captured[key]]));
    if (!Object.keys(patch).length) { setDirty(false); return true; }
    savingRef.current = true; setSaving(true); setSaveError('');
    try {
      const result = await portalApi('details', { projectId: project.id, revision: base.surveyRevision, details: patch, base: base.survey });
      const next = initialDetails(result.project.survey);
      for (const [key] of fields) if (draftRef.current[key] !== captured[key]) next[key] = draftRef.current[key];
      baseRef.current = result.project; draftRef.current = next; setDraft(next);
      setDirty(fields.some(([key]) => next[key] !== initialDetails(result.project.survey)[key]));
      setBlocked(false); onSaved(result.project); return true;
    } catch(error) { setSaveError(error.message); setBlocked(true); return false; }
    finally { savingRef.current = false; setSaving(false); }
  }
  useEffect(() => {
    if (!dirty || saving || blocked || busy) return;
    const timer = setTimeout(save, 1500); return () => clearTimeout(timer);
  }, [draft, dirty, saving, blocked, busy]);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function reload() { const next = initialDetails(project.survey); setDraft(next); draftRef.current = next; baseRef.current = project; setDirty(false); setSaveError(''); setBlocked(false); }
  const current = agreements.find(item => item.status !== 'Superseded' && sameEvent(item.snapshot, project.survey));
  const selected = agreements.find(item => item.id === agreementId) || current || agreements[0];
  useEffect(() => { setSignedName(''); setConfirm(false); }, [selected?.id]);
  return <section className={styles.card}>
    <div className={styles.noPrint}><h2>Event details</h2><p>One shared form for you and Maison Lucia. Changes save automatically after a short pause. These details become your event plan; pricing comes later in the proposal.</p>
      <div className={styles.actions}><button type="button" aria-pressed={mode === 'Form'} disabled={saving} onClick={() => setMode('Form')}>Edit shared form</button><button type="button" aria-pressed={mode === 'Summary'} disabled={dirty || saving} onClick={() => setMode('Summary')}>Summary & working list</button></div>
      <p role="status">{saving ? 'Saving your changes…' : saveError ? 'Changes have not been saved.' : dirty ? 'Changes waiting to save…' : project.survey.detailsUpdatedAt ? `All changes saved · ${project.survey.detailsUpdatedBy} · ${new Date(project.survey.detailsUpdatedAt).toLocaleString()}` : 'No changes waiting to save.'}</p>
      {saveError && <p role="alert" className={styles.error}>{saveError}</p>}
      {dirty && <div className={styles.actions}><button type="button" className={styles.primary} disabled={saving || busy} onClick={() => { setBlocked(false); save(); }}>Save now</button><button type="button" disabled={saving || busy} onClick={reload}>Load latest saved details</button></div>}
    </div>
    {mode === 'Form' && <div className={styles.noPrint}><InspirationLinks /><form className={styles.form} onSubmit={event => { event.preventDefault(); save(); }} noValidate>
      {groups.map(group => <fieldset key={group.title} disabled={busy} className={styles.card}><legend>{group.title}</legend><div className={styles.grid}>
        {fields.slice(group.start, group.end).map(([key,label,type,required,options]) => <label key={key} className={type === 'textarea' ? styles.wide : ''}>{label}
          {key === 'email' ? <><input type="email" readOnly value={draft.email} /><small>This is the email attached to your private portal.</small></> : type === 'textarea' ? <textarea rows={3} maxLength={3000} value={draft[key]} onChange={event => edit(key,event.target.value)} /> : type === 'select' ? <select value={draft[key]} onChange={event => edit(key,event.target.value)}><option value="">Choose or leave undecided</option>{options.map(option => <option key={option}>{option}</option>)}</select> : <input type={type} min={type === 'number' ? 0 : undefined} max={type === 'number' ? 100000 : undefined} maxLength={250} value={draft[key]} onChange={event => edit(key,event.target.value)} />}
        </label>)}
      </div></fieldset>)}
      <button className={styles.primary} disabled={saving || busy || !dirty}>{saving ? 'Saving…' : 'Save event details now'}</button>
    </form><p>Share additional inspiration photos in Conversation or under a design idea.</p></div>}
    {mode === 'Summary' && <>
      <div className={styles.noPrint}>{admin && <p><button className={styles.primary} disabled={busy || dirty || saving} onClick={async () => { if (await send('event-agreement', { revision: project.surveyRevision })) setAgreementId(''); }}>{current ? 'Prepare a new agreement version' : 'Prepare event agreement for client signature'}</button></p>}
      {!admin && !current && <p>Maison Lucia will prepare the event agreement for your signature after you have discussed the details.</p>}
      {agreements.length > 0 && <label>Agreement version<select value={selected?.id || ''} onChange={event => setAgreementId(event.target.value)}>{agreements.map(item => <option key={item.id} value={item.id}>Version {item.version} · {item.status}{!sameEvent(item.snapshot,project.survey) ? ' · Earlier details' : ''}</option>)}</select></label>}
      <button type="button" onClick={() => window.print()}>Print / Save as PDF</button></div>
      <article className={styles.eventSummary}><h2>Maison Lucia — Event plan</h2><p>{selected ? `Agreement version ${selected.version} · ${selected.status}` : 'Working summary · Not yet signed'}</p>
      <p>Event scope and planning details only. Prices, payment terms and the financial proposal are separate.</p>
      {selected && !sameEvent(selected.snapshot,project.survey) && <p>This is an earlier version. The current form has changed; a new agreement is required for the updated details.</p>}
      <dl className={styles.details}>{fields.map(([key,label]) => <div key={key} style={{display:'contents'}}><dt>{label}</dt><dd>{(selected?.snapshot || project.survey)[key] || 'To be confirmed'}{selected && !['name','email','phone'].includes(key) && (selected.snapshot[key]) && <label className={`${styles.check} ${styles.noPrint}`}><input type="checkbox" disabled={!admin || busy || selected.status === 'Superseded'} checked={selected.completed_fields.includes(key)} onChange={event => send('event-task',{ agreementId:selected.id,field:key,done:event.target.checked })} />Done</label>} {selected && selected.snapshot[key] && !['name','email','phone'].includes(key) && <small>Working list: {selected.completed_fields.includes(key) ? 'Done' : 'To do'}</small>}</dd></div>)}</dl>
      {selected?.signed_at ? <section><h3>Client sign-off</h3><p>Signed electronically by <strong>{selected.signed_by}</strong><br />{selected.signed_email}<br />{new Date(selected.signed_at).toLocaleString()}<br />Record: {selected.id}</p><p>The client confirmed this version of the event details. Financial approval is handled separately in Proposal.</p></section> : <p>Client signature: Awaiting sign-off.</p>}
      </article>
      {!admin && selected?.status === 'Pending' && sameEvent(selected.snapshot,project.survey) && <form className={`${styles.form} ${styles.noPrint}`} onSubmit={async event => { event.preventDefault(); if (await send('sign-event',{ agreementId:selected.id,name:signedName,confirm })) setConfirm(false); }}>
        <label>Full name for your electronic signature<input required maxLength={250} value={signedName} onChange={event => setSignedName(event.target.value)} /></label>
        <label className={styles.check}><input type="checkbox" checked={confirm} onChange={event => setConfirm(event.target.checked)} required />I have reviewed this version of the event details and agree to this event plan. I intend my typed name to be my electronic signature. Pricing and payment terms will be reviewed separately in the proposal.</label>
        <button className={styles.primary} disabled={busy || !confirm || !signedName.trim()}>Sign event agreement</button>
      </form>}
    </>}
  </section>;
}
