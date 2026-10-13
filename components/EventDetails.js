import { useEffect, useState } from 'react';
import { fields } from '../lib/portal-fields';
import { InspirationLinks } from './PortalShell';
import styles from '../styles/Portal.module.css';
const groups = [{ title: 'You & your celebration', start: 0, end: 7 }, { title: 'The setting & scope', start: 7, end: 13 }, { title: 'Your design direction', start: 13, end: 21 }, { title: 'Details & inspiration', start: 21, end: fields.length }];
function initialDetails(survey) {
  return Object.fromEntries(fields.map(([key]) => [key, key === 'services' && survey.intakeSource === 'manager' && survey[key] === 'Details to be discussed in the portal.' ? '' : survey[key] || '']));
}
export default function EventDetails({ project, send, busy }) {
  const [draft, setDraft] = useState(() => initialDetails(project.survey));
  const [revision, setRevision] = useState(project.surveyRevision), [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) { setDraft(initialDetails(project.survey)); setRevision(project.surveyRevision); }
  }, [project.survey, project.surveyRevision, dirty]);
  const changedElsewhere = dirty && revision !== project.surveyRevision;
  function reload() { setDraft(initialDetails(project.survey)); setRevision(project.surveyRevision); setDirty(false); }
  return <section className={styles.card}>
    <h2>Event details</h2><p>A shared planning form for you and Maison Lucia. Either of you can fill in the details as you discuss your event. Leave anything undecided blank, then save when you are ready.</p>
    <InspirationLinks />
    {project.survey.detailsUpdatedAt && <p>Last saved by {project.survey.detailsUpdatedBy} on {new Date(project.survey.detailsUpdatedAt).toLocaleString()}.</p>}
    {changedElsewhere && <p role="status" className={styles.notice}>New details were saved while you were editing. Your draft is still here. Load the latest details before making further changes.</p>}
    <form className={styles.form} onSubmit={async event => { event.preventDefault(); if (await send('details', { details: draft, revision })) setDirty(false); }}>
      {groups.map(group => <fieldset key={group.title} disabled={busy} className={styles.card}><legend>{group.title}</legend><div className={styles.grid}>
        {fields.slice(group.start, group.end).map(([key, label, type, required, options]) => <label key={key} className={type === 'textarea' ? styles.wide : ''}>{label}
          {key === 'email' ? <><input type="email" readOnly value={draft.email} /><small>This is the email attached to your private portal.</small></> : type === 'textarea' ? <textarea rows={3} maxLength={3000} value={draft[key]} onChange={event => { setDraft({ ...draft, [key]: event.target.value }); setDirty(true); }} /> : type === 'select' ? <select value={draft[key]} onChange={event => { setDraft({ ...draft, [key]: event.target.value }); setDirty(true); }}><option value="">Choose or leave undecided</option>{options.map(option => <option key={option}>{option}</option>)}</select> : <input type={type} min={type === 'number' ? 0 : undefined} max={type === 'number' ? 100000 : undefined} maxLength={250} value={draft[key]} onChange={event => { setDraft({ ...draft, [key]: event.target.value }); setDirty(true); }} />}
        </label>)}
      </div></fieldset>)}
      <div className={styles.actions}><button className={styles.primary} disabled={busy || !dirty || changedElsewhere}>{busy ? 'Saving…' : 'Save event details'}</button>{dirty && <button type="button" disabled={busy} onClick={reload}>{changedElsewhere ? 'Load latest details' : 'Discard unsaved changes'}</button>}</div>
      {dirty && <p role="status">You have unsaved changes. Save before leaving this tab.</p>}
    </form>
    {project.survey.images?.length > 0 && <><h3>Questionnaire inspiration images</h3><div className={styles.images}>{project.survey.images.map((src, index) => <a key={index} href={src} download={`inspiration-${index + 1}.jpg`}><img src={src} alt={`Client inspiration ${index + 1}`} /></a>)}</div></>}
    <p>Share additional inspiration photos in Conversation or under a design idea.</p>
  </section>;
}
