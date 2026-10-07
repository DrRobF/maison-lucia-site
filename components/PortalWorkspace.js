import { useEffect, useState } from 'react';
import PortalShell, { InspirationLinks, portalApi, readImages } from './PortalShell';
import { fields } from '../lib/portal-fields';
import styles from '../styles/Portal.module.css';

const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const when = value => new Date(value).toLocaleString();
function Conversation({ messages, designId = null, send, busy }) {
  const [draft, setDraft] = useState('');
  return <section><h3>{designId ? 'Thoughts & suggested changes' : 'Your conversation'}</h3>
    {messages.filter(message => message.design_id === designId).map(message => <div key={message.id} className={styles.message}><strong>{message.role === 'admin' ? 'Maison Lucia' : 'Client'}</strong><time dateTime={message.created_at}>{when(message.created_at)}</time>{message.body}</div>)}
    <form onSubmit={async event => { event.preventDefault(); if (await send('message', { message: draft, designId })) setDraft(''); }} className={styles.form}>
      <label>{designId ? 'Comment on this design' : 'Write to Maison Lucia or your client'}<textarea rows={3} maxLength={5000} required value={draft} onChange={event => setDraft(event.target.value)} /></label>
      <button disabled={busy || !draft.trim()} type="submit">Send message</button>
    </form>
  </section>;
}
function ProposalView({ proposal, invoice = false, project }) {
  const details = proposal.details;
  return <div>
    <p className={styles.eyebrow}>{invoice ? `Invoice ${proposal.invoice_number}` : `Proposal · Version ${proposal.version}`}</p>
    <h2>{details.title}</h2><p>{project.survey.eventTitle} · Prepared for {project.survey.name}</p>
    <p>{project.survey.email}{project.survey.eventDate ? ` · Event date: ${project.survey.eventDate}` : ''}</p>
    <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">Description</th><th scope="col">Quantity</th><th scope="col">Unit price</th><th scope="col">Amount</th></tr></thead><tbody>{details.items.map((item, index) => <tr key={index}><td>{item.description}</td><td>{item.quantity}</td><td>{money(item.unitCents)}</td><td>{money(item.totalCents)}</td></tr>)}{details.extraCents > 0 && <tr><td colSpan={3}>{details.extraLabel}</td><td>{money(details.extraCents)}</td></tr>}</tbody></table></div>
    <p className={styles.total}>Total: {money(details.totalCents)}</p>
    {details.terms && <><h3>Scope, terms & payment arrangements</h3><p className={styles.pre}>{details.terms}</p></>}
    {proposal.approved_at && <p>Approved by {proposal.approved_by} on {when(proposal.approved_at)} · Proposal version {proposal.version}</p>}
    {invoice && <p>Payment status: awaiting offline payment confirmation. This portal does not collect payments.</p>}
  </div>;
}
const emptyProposal = () => ({ title: 'Event styling proposal', items: [{ description: '', quantity: 1, price: '' }], extra: '', extraLabel: 'Additional charges', terms: '' });

export default function PortalWorkspace({ admin = false }) {
  const [auth, setAuth] = useState(null), [checking, setChecking] = useState(true), [credential, setCredential] = useState('');
  const [projects, setProjects] = useState([]), [selected, setSelected] = useState(''), [data, setData] = useState(null), [tab, setTab] = useState('Design ideas');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [code, setCode] = useState(''), [notice, setNotice] = useState('');
  const [design, setDesign] = useState({ title: '', description: '', images: [] }), [uploading, setUploading] = useState(false);
  const [proposal, setProposal] = useState(emptyProposal), [approvalName, setApprovalName] = useState(''), [confirm, setConfirm] = useState(false), [invoiceId, setInvoiceId] = useState('');
  useEffect(() => {
    portalApi('session').then(result => { if ((result.role === 'admin') === admin) { setAuth(result); if (!admin) setSelected(result.project_id); } }).catch(error => { if (error.status !== 401) setError(error.message); }).finally(() => setChecking(false));
  }, [admin]);
  async function refresh() {
    if (admin) { const result = await portalApi('projects'); setProjects(result.projects); }
    if (selected) setData(await portalApi('project', null, selected));
  }
  useEffect(() => {
    if (!auth) return;
    let current = true;
    const load = async () => {
      try {
        if (admin) { const result = await portalApi('projects'); if (current) setProjects(result.projects); }
        if (selected) { const result = await portalApi('project', null, selected); if (current) setData(result); }
      } catch (error) { if (current) { setError(error.message); if (error.status === 401) { setAuth(null); setData(null); } } }
    };
    load(); const interval = setInterval(load, 30000);
    return () => { current = false; clearInterval(interval); };
  }, [auth, selected, admin]);
  function choose(id) { setSelected(id); setData(null); setCode(''); setNotice(''); setError(''); setDesign({ title: '', description: '', images: [] }); setProposal(emptyProposal()); setInvoiceId(''); setApprovalName(''); setConfirm(false); }
  async function login(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await portalApi('login', admin ? { admin: true, password: credential } : { code: credential }); setAuth(result); setCredential(''); if (!admin) setSelected(result.projectId); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  async function send(action, values = {}) {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await portalApi(action, { ...values, projectId: selected });
      if (result.code) setCode(result.code);
      await refresh();
      setNotice(action === 'approve' ? 'Proposal approved. Your invoice is ready in Invoices.' : action === 'code' ? 'Client code created. Share it privately with your client.' : 'Saved.');
      return true;
    } catch (error) { setError(error.message); if (error.status === 401) setAuth(null); return false; }
    finally { setBusy(false); }
  }
  const activeProposal = data?.proposals.find(item => item.status === 'Pending');
  useEffect(() => { setConfirm(false); }, [activeProposal?.id]);
  const invoices = data?.proposals.filter(item => item.status === 'Approved') || [];
  const invoice = invoices.find(item => item.id === invoiceId) || invoices[0];
  return <PortalShell title={admin ? 'Client Management' : 'Your Client Portal'} privatePage>
    {checking ? <p role="status">Opening your portal…</p> : !auth ? <section className={`${styles.card} ${styles.login}`}>
      <p className={styles.eyebrow}>{admin ? 'Maison Lucia management' : 'Your private event workspace'}</p><h1>{admin ? 'Client management' : 'Welcome to your portal.'}</h1>
      <p>{admin ? 'Sign in to review inquiries and manage your clients.' : 'Enter the client code Maison Lucia gave you. You can paste it with or without hyphens.'}</p>
      <form onSubmit={login} className={styles.form}><label>{admin ? 'Management password' : 'Client code'}<input type={admin ? 'password' : 'text'} autoComplete={admin ? 'current-password' : 'off'} maxLength={500} value={credential} onChange={event => setCredential(event.target.value)} required spellCheck={false} /></label>
        {error && <p className={styles.error} role="alert">{error}</p>}<button className={styles.primary} disabled={busy}>{busy ? 'Opening…' : 'Open my workspace'}</button>
      </form>{!admin && <p>Planning a new event? <a href="/event-questionnaire">Complete the questionnaire</a>.</p>}
    </section> : <>
      <div className={`${styles.actions} ${styles.noPrint}`}><h1>{admin ? 'Client management' : 'Your event workspace'}</h1><button disabled={busy} onClick={async () => { setBusy(true); try { await refresh(); setError(''); } catch (error) { setError(error.message); } finally { setBusy(false); } }}>Refresh</button><button disabled={busy} onClick={async () => { try { await portalApi('logout', {}); setAuth(null); setData(null); setCode(''); } catch (error) { setError(error.message); } }}>Sign out</button></div>
      {error && <p role="alert" className={styles.error}>{error}</p>}{notice && <p role="status" className={`${styles.notice} ${styles.noPrint}`}>{notice}</p>}
      <div className={admin ? styles.layout : ''}>
        {admin && <aside><h2>Inquiries & clients</h2>{projects.length === 0 && <p>New questionnaires will appear here.</p>}{projects.map(project => <button key={project.id} className={`${styles.projectButton} ${selected === project.id ? styles.selected : ''}`} onClick={() => choose(project.id)} disabled={busy}><strong>{project.title}</strong><span>{project.name}</span><span>{project.event_date || 'Date undecided'} · {project.status}</span></button>)}</aside>}
        <div>{!selected ? <section className={styles.card}><h2>Every event, in one place.</h2><p>Select an inquiry to review the questionnaire, issue a client code, and begin the design conversation.</p><a href="/event-questionnaire">View the event questionnaire</a></section> : !data ? <p role="status">Loading event…</p> : <>
          <div className={styles.noPrint}><p className={styles.eyebrow}>{data.project.status}</p><h2>{data.project.survey.eventTitle}</h2><p>{data.project.survey.name}{data.project.survey.eventDate ? ` · ${data.project.survey.eventDate}` : ''}</p><InspirationLinks />
          {admin && <section className={styles.notice}><p>Client access: {data.project.has_code ? 'Code issued. Replacing it signs out this client’s active sessions and disables the previous code.' : 'No client code issued yet.'}</p><button disabled={busy} onClick={() => send('code')}>{data.project.has_code ? 'Replace client code' : 'Create client code'}</button>{code && <><code className={styles.code}>{code}</code><p>This code is shown here only now. Share it privately with the client and include {typeof window !== 'undefined' ? `${window.location.origin}/portal` : '/portal'}.</p><button onClick={async () => { try { await navigator.clipboard.writeText(code); setNotice('Code copied.'); } catch { setNotice('Select and copy the code above.'); } }}>Copy code</button></>}</section>}
          <div className={styles.tabs} aria-label="Event sections">{['Design ideas', 'Conversation', 'Questionnaire', 'Proposal', 'Invoices'].map(item => <button key={item} aria-pressed={tab === item} onClick={() => { setTab(item); setConfirm(false); }} disabled={busy}>{item}{item === 'Invoices' && invoices.length ? ` (${invoices.length})` : ''}</button>)}</div></div>
          {tab === 'Questionnaire' && <section className={styles.card}><h2>Original event questionnaire</h2><dl className={styles.details}>{fields.map(([key, label]) => <div key={key} style={{ display: 'contents' }}><dt>{label}</dt><dd>{data.project.survey[key] || 'Not provided'}</dd></div>)}</dl><div className={styles.images}>{data.project.survey.images?.map((src, index) => <a key={index} href={src} download={`inspiration-${index + 1}.jpg`}><img src={src} alt={`Client inspiration ${index + 1}`} /></a>)}</div></section>}
          {tab === 'Design ideas' && <>
            {data.designs.length === 0 && <section className={styles.card}><h2>Design ideas are on their way.</h2><p>Maison Lucia’s concepts will appear here. Each idea has its own space for your thoughts and requested changes.</p></section>}
            {data.designs.map(item => <article key={item.id} className={styles.card}><h2>{item.title}</h2><p className={styles.pre}>{item.description}</p><div className={styles.images}>{item.images.map((src, index) => <a key={index} href={src} download={`design-${index + 1}.jpg`}><img src={src} alt={`${item.title}, view ${index + 1}`} /></a>)}</div><Conversation messages={data.messages} designId={item.id} send={send} busy={busy} /></article>)}
            {admin && <section className={styles.card}><h2>Add a design idea</h2><form className={styles.form} onSubmit={async event => { event.preventDefault(); if (await send('design', design)) setDesign({ title: '', description: '', images: [] }); }}>
              <label>Design title<input required maxLength={250} value={design.title} onChange={event => setDesign({ ...design, title: event.target.value })} /></label><label>Description & recommendations<textarea rows={4} required maxLength={5000} value={design.description} onChange={event => setDesign({ ...design, description: event.target.value })} /></label>
              <label>Design images (up to three)<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || busy} onChange={async event => { setUploading(true); try { setDesign({ ...design, images: await readImages(event.target.files) }); } catch (error) { setError(error.message); event.target.value = ''; } finally { setUploading(false); } }} /></label><div className={styles.images}>{design.images.map((src, index) => <img key={index} src={src} alt={`New design preview ${index + 1}`} />)}</div>
              <button disabled={busy || uploading} className={styles.primary}>{uploading ? 'Preparing images…' : 'Share design with client'}</button>
            </form></section>}
          </>}
          {tab === 'Conversation' && <section className={styles.card}><Conversation key={selected} messages={data.messages} send={send} busy={busy} /></section>}
          {tab === 'Proposal' && <>
            {activeProposal ? <section className={styles.card}><ProposalView proposal={activeProposal} project={data.project} />
              {!admin && <form className={styles.form} onSubmit={async event => { event.preventDefault(); if (await send('approve', { proposalId: activeProposal.id, name: approvalName, confirm })) { setTab('Invoices'); setConfirm(false); } }}>
                <label>Your full name<input required maxLength={250} value={approvalName} onChange={event => setApprovalName(event.target.value)} /></label><label className={styles.check}><input type="checkbox" checked={confirm} required onChange={event => setConfirm(event.target.checked)} />I approve proposal version {activeProposal.version}, including the scope, total of {money(activeProposal.details.totalCents)}, and stated terms.</label><button className={styles.primary} disabled={busy || !confirm}>Approve this proposal & create invoice</button><p>Need changes first? Send them in the Conversation tab.</p>
              </form>}
            </section> : <section className={styles.card}><h2>{invoices.length ? 'Your approved proposal is saved.' : 'Your proposal will appear here.'}</h2><p>{invoices.length ? 'See Invoices for the accepted details and approval record.' : 'Maison Lucia will prepare it after reviewing your event and design preferences.'}</p></section>}
            {admin && <section className={styles.card}><h2>{data.proposals.length ? 'Prepare a revised proposal' : 'Prepare a proposal'}</h2><p>Sharing creates a new version and replaces any pending version. Accepted proposals and invoices remain unchanged.</p>
              {data.proposals[0] && <button type="button" onClick={() => { const source = data.proposals[0].details; setProposal({ title: source.title, items: source.items.map(item => ({ description: item.description, quantity: item.quantity, price: item.unitCents / 100 })), extra: source.extraCents / 100, extraLabel: source.extraLabel, terms: source.terms }); }}>Use latest proposal as starting point</button>}
              <form className={styles.form} onSubmit={async event => { event.preventDefault(); if (await send('proposal', proposal)) setProposal(emptyProposal()); }}>
                <label>Proposal title<input required maxLength={250} value={proposal.title} onChange={event => setProposal({ ...proposal, title: event.target.value })} /></label>
                {proposal.items.map((item, index) => <div className={styles.lineItem} key={index}>{[['description', 'Description', 'text'], ['quantity', 'Quantity', 'number'], ['price', 'Unit price ($)', 'number']].map(([key, label, type]) => <label key={key}>{label}<input type={type} required min={key === 'quantity' ? .01 : key === 'price' ? 0 : undefined} step={type === 'number' ? '.01' : undefined} maxLength={500} value={item[key]} onChange={event => setProposal({ ...proposal, items: proposal.items.map((value, itemIndex) => itemIndex === index ? { ...value, [key]: event.target.value } : value) })} /></label>)}<button type="button" aria-label={`Remove item ${index + 1}`} disabled={proposal.items.length === 1} onClick={() => setProposal({ ...proposal, items: proposal.items.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div>)}
                <button type="button" disabled={proposal.items.length >= 50} onClick={() => setProposal({ ...proposal, items: [...proposal.items, { description: '', quantity: 1, price: '' }] })}>Add line item</button>
                <div className={styles.grid}><label>Additional charge label<input maxLength={250} value={proposal.extraLabel} onChange={event => setProposal({ ...proposal, extraLabel: event.target.value })} /></label><label>Additional charge amount ($)<input type="number" min="0" step=".01" value={proposal.extra} onChange={event => setProposal({ ...proposal, extra: event.target.value })} /></label></div>
                <label>Scope, exclusions, delivery / setup, taxes, and payment arrangements<textarea maxLength={8000} rows={5} value={proposal.terms} onChange={event => setProposal({ ...proposal, terms: event.target.value })} /></label>
                <button className={styles.primary} disabled={busy}>Share proposal for client approval</button>
              </form>
            </section>}
            {data.proposals.filter(item => item.status === 'Superseded').map(item => <details className={styles.card} key={item.id}><summary>Earlier proposal · Version {item.version} · Superseded</summary><ProposalView proposal={item} project={data.project} /></details>)}
          </>}
          {tab === 'Invoices' && (invoice ? <section className={styles.card}><div className={`${styles.actions} ${styles.noPrint}`}><label>Invoice<select value={invoice.id} onChange={event => setInvoiceId(event.target.value)}>{invoices.map(item => <option key={item.id} value={item.id}>{item.invoice_number} · Version {item.version}</option>)}</select></label><button onClick={() => window.print()}>Print / save PDF</button></div><p className={styles.brand}>Maison Lucia LLC</p><ProposalView proposal={invoice} invoice project={data.project} /></section> : <section className={styles.card}><h2>No invoice yet.</h2><p>An invoice appears automatically when the client approves a proposal.</p></section>)}
        </>}</div>
      </div>
    </>}
  </PortalShell>;
}
