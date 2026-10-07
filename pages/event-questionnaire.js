import { useEffect, useState } from 'react';
import PortalShell, { InspirationLinks, portalApi, readImages } from '../components/PortalShell';
import { fields } from '../lib/portal-fields';
import styles from '../styles/Portal.module.css';

const groups = [{ title: 'You & your celebration', start: 0, end: 7 }, { title: 'The setting & scope', start: 7, end: 13 }, { title: 'Your design direction', start: 13, end: 21 }, { title: 'Details & inspiration', start: 21, end: fields.length }];
export default function Questionnaire() {
  const [survey, setSurvey] = useState({ images: [] });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [success, setSuccess] = useState(false), [ready, setReady] = useState(null), [uploading, setUploading] = useState(false);
  useEffect(() => { portalApi('ready').then(result => setReady(result.ready)).catch(() => setReady(false)); }, []);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await portalApi('inquiry', { survey, website: new FormData(event.currentTarget).get('website') }); setSuccess(true); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <PortalShell title="Your Event Questionnaire">
    <p className={styles.eyebrow}>A celebration that feels like you</p><h1>Tell us what you have in mind.</h1>
    {success ? <section className={styles.card} role="status"><h2>Your questionnaire is with Maison Lucia.</h2><p>We’ll review your ideas and contact you with a private client code. Your questionnaire, design ideas, conversations, proposal, and invoice will be together in your portal.</p><a href="/portal">Go to the client portal</a></section> : <>
      <p className={styles.intro}>Share the essentials and the details you love. It’s fine to leave undecided items blank. Maison Lucia will review your responses before issuing your private portal code.</p>
      <InspirationLinks /><p>Use Atmos to explore ideas or the color tool to find a palette. Add your favorites below.</p>
      {ready === false && <p className={styles.notice}>The questionnaire is being prepared. Please <a href="/#contact">contact Maison Lucia</a> to discuss your event in the meantime.</p>}
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        {groups.map(group => <fieldset key={group.title} className={styles.card}><legend>{group.title}</legend><div className={styles.grid}>
          {fields.slice(group.start, group.end).map(([key, label, type, required, options]) => <label key={key} className={type === 'textarea' ? styles.wide : ''}>{label}{required ? ' *' : ''}
            {type === 'textarea' ? <textarea rows={3} value={survey[key] || ''} required={required} maxLength={3000} onChange={event => setSurvey({ ...survey, [key]: event.target.value })} /> : type === 'select' ? <select value={survey[key] || ''} onChange={event => setSurvey({ ...survey, [key]: event.target.value })}><option value="">Choose or leave undecided</option>{options.map(option => <option key={option}>{option}</option>)}</select> : <input type={type} required={required} min={type === 'number' ? 0 : undefined} max={type === 'number' ? 100000 : undefined} maxLength={250} value={survey[key] || ''} onChange={event => setSurvey({ ...survey, [key]: event.target.value })} />}
          </label>)}
        </div></fieldset>)}
        <section className={styles.card}><h2>Inspiration images</h2><label>Up to three JPG, PNG, or WebP images (8 MB each before resizing)<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} onChange={async event => { setUploading(true); setError(''); try { setSurvey({ ...survey, images: await readImages(event.target.files) }); } catch (error) { setError(error.message); event.target.value = ''; } finally { setUploading(false); } }} /></label><div className={styles.images}>{survey.images.map((src, index) => <img src={src} alt={`Your inspiration ${index + 1}`} key={index} />)}</div>
        </section>
        <p>Fields marked * are required. Your responses will be shared privately with Maison Lucia for planning your event.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.primary} disabled={busy || uploading || ready !== true}>{busy ? 'Sending…' : uploading ? 'Preparing images…' : 'Send my event questionnaire'}</button>
      </form>
    </>}
  </PortalShell>;
}
