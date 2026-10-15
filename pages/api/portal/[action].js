const { randomUUID, randomBytes } = require('node:crypto');
const { database } = require('../../../lib/portal-db');
const { invitationsReady, sendInvitation } = require('../../../lib/portal-invitations');
const { contractNotification } = require('../../../lib/portal-contract-notifications');
const { fields, fail, text, cleanSurvey, cleanClient, cleanEventDetails, eventSnapshot, cleanImages, cleanProposal, hash, matches, newCode, normalizeCode } = require('../../../lib/portal-model');
const { ownerEmail, managerAuthorized, ownerReady, ownerCodeHash, newOwnerCode, sendOwnerCode } = require('../../../lib/portal-owner');
const cookieName = 'ml_portal';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cookie(token, seconds) {
  return `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${seconds}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
function readToken(req) {
  return String(req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || '';
}
async function session(db, req) {
  const token = readToken(req);
  if (!/^[a-f0-9]{64}$/.test(token)) fail('Please sign in to your portal.', 401);
  const result = await db.query('SELECT role, project_id FROM ml_sessions WHERE token_hash=$1 AND expires_at>now()', [hash(token)]);
  if (!result.rows[0]) fail('Your session has expired. Please sign in again.', 401);
  return result.rows[0];
}
async function rateLimit(db, req, kind, maximum) {
  const forwarded = process.env.VERCEL ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : req.socket.remoteAddress;
  const key = hash(`${kind}:${forwarded || 'unknown'}`);
  const result = await db.query(`INSERT INTO ml_rate_limits(key,count,expires_at) VALUES($1,1,now()+interval '15 minutes')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN ml_rate_limits.expires_at<now() THEN 1 ELSE ml_rate_limits.count+1 END,
    expires_at=CASE WHEN ml_rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE ml_rate_limits.expires_at END RETURNING count`, [key]);
  if (result.rows[0].count > maximum) fail('Too many attempts. Please try again in 15 minutes.', 429);
}
async function projectFor(db, auth, id) {
  if (auth.role === 'client' && id && id !== auth.project_id) fail('Access denied.', 403);
  const projectId = auth.role === 'admin' ? id : auth.project_id;
  if (!uuid.test(projectId || '')) fail('Please select an event.');
  const result = await db.query('SELECT id,survey,status,created_at,code_hash IS NOT NULL AS has_code FROM ml_projects WHERE id=$1', [projectId]);
  if (!result.rows[0]) fail('Event not found.', 404);
  return { ...result.rows[0], surveyRevision: hash(JSON.stringify(result.rows[0].survey)) };
}
async function notify(survey) {
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!key) return false;
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ access_key: key, subject: `New Maison Lucia event questionnaire: ${survey.eventTitle}`, from_name: 'Maison Lucia Client Portal', email: survey.email, name: survey.name,
        message: fields.map(([key, label]) => `${label}: ${survey[key] || 'Not provided'}`).join('\n\n') + '\n\nInspiration images and the complete inquiry are in /portal/manage. Review it there and issue the client code.' }),
    });
    return response.ok && (await response.json()).success === true;
  } catch { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const action = req.query.action;
  const reads = ['session', 'projects', 'project', 'ready', 'contract-file'];
  try {
    if (!reads.includes(action) && req.method !== 'POST') fail('Method not allowed.', 405);
    if (reads.includes(action) && req.method !== 'GET') fail('Method not allowed.', 405);
    if (req.method === 'POST') {
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) fail('JSON required.', 415);
      if (req.headers.origin) {
        let origin;
        try { origin = new URL(req.headers.origin); } catch { fail('Request not allowed.', 403); }
        if (origin.host !== req.headers.host) fail('Request not allowed.', 403);
      }
    }
    if (action === 'ready') {
      const configured = Boolean(process.env.DATABASE_URL && process.env.PORTAL_ADMIN_PASSWORD?.length >= 16);
      if (!configured) return res.json({ ready: false, configured: false, emailInvitesReady: invitationsReady(), ownerLoginReady: ownerReady() });
      try {
        await database().query('SELECT id FROM ml_projects LIMIT 0');
        return res.json({ ready: true, configured: true, emailInvitesReady: invitationsReady(), ownerLoginReady: ownerReady() });
      } catch (error) {
        // Report only known categories, never connection strings or server messages.
        const categories = {
          '28P01': 'authentication', '28000': 'authentication',
          ENOTFOUND: 'hostname', EAI_AGAIN: 'hostname',
          SELF_SIGNED_CERT_IN_CHAIN: 'certificate', DEPTH_ZERO_SELF_SIGNED_CERT: 'certificate',
          UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'certificate', CERT_HAS_EXPIRED: 'certificate',
          ERR_TLS_CERT_ALTNAME_INVALID: 'certificate',
          ETIMEDOUT: 'network', ECONNREFUSED: 'network',
          '42P01': 'schema', '42501': 'permissions', ERR_INVALID_URL: 'connection_string',
        };
        return res.json({ ready: false, configured: true, databaseError: categories[error.code] || 'connection' });
      }
    }
    const db = database();
    const body = req.body || {};
    if (action === 'inquiry') {
      await rateLimit(db, req, 'inquiry', 10);
      if (body.website) fail('Unable to submit.');
      const survey = cleanSurvey(body.survey);
      await db.query('INSERT INTO ml_projects(id,survey) VALUES($1,$2)', [randomUUID(), survey]);
      const notified = await notify(survey);
      return res.status(201).json({ saved: true, notified });
    }
    if (action === 'client-code') {
      await rateLimit(db, req, 'client-code', 5);
      if (!invitationsReady() || !ownerReady()) fail('Email sign-in is temporarily unavailable.', 503);
      const email = text(body.email, 250).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email address.');
      const id = randomUUID();
      const found = await db.query("SELECT id FROM ml_projects WHERE lower(trim(survey->>'email'))=$1 AND code_hash IS NOT NULL LIMIT 2", [email]);
      if (found.rows.length === 1) {
        await rateLimit(db, { ...req, socket: { remoteAddress: email }, headers: { ...req.headers, 'x-forwarded-for': email } }, 'client-mailbox', 5);
        const code = newOwnerCode();
        await db.query("INSERT INTO ml_owner_codes(id,email,code_hash,expires_at) VALUES($1,$2,$3,now()+interval '10 minutes')", [id,email,ownerCodeHash(id,code)]);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: process.env.PORTAL_INVITE_FROM, to: [email], subject: 'Your Maison Lucia sign-in code',
            text: `Your Maison Lucia client portal sign-in code is ${code}. It expires in 10 minutes. Open https://www.maisonluciallc.com/portal to sign in. If you did not request this, ignore this email.` }),
          signal: AbortSignal.timeout(8000),
        }).catch(() => null);
        if (!response?.ok) {
          await db.query('UPDATE ml_owner_codes SET consumed_at=now() WHERE id=$1', [id]);
          fail('Unable to send the sign-in email. Please try again later or use your original client code.', 503);
        }
      }
      return res.json({ challengeId: id, message: 'If this email belongs to one client event, a sign-in code has been sent. Check your inbox.' });
    }
    if (action === 'owner-code') {
      await rateLimit(db, req, 'owner-code', 5);
      if (!ownerReady()) fail('Owner email sign-in is being prepared. Please use the management password for now.', 503);
      const email = text(body.email, 250).trim().toLowerCase(), id = randomUUID();
      if (managerAuthorized(email)) {
        await rateLimit(db, { ...req, socket: { remoteAddress: email }, headers: { ...req.headers, 'x-forwarded-for': email } }, 'owner-mailbox', 5);
        const code = newOwnerCode();
        await db.query("INSERT INTO ml_owner_codes(id,email,code_hash,expires_at) VALUES($1,$2,$3,now()+interval '10 minutes')", [id, email, ownerCodeHash(id, code)]);
        if (!await sendOwnerCode(code, id, { email })) {
          await db.query('UPDATE ml_owner_codes SET consumed_at=now() WHERE id=$1', [id]);
          fail('The sign-in email could not be sent. Please try again later or use the management password.', 503);
        }
      }
      return res.json({ challengeId: id, message: 'If this is the owner email, a sign-in code has been sent. Check your inbox and spam folder.' });
    }
    if (action === 'login') {
      await rateLimit(db, req, 'login', 10);
      let role, projectId = null;
      if (body.clientEmail === true) {
        if (!ownerReady()) fail('Client email sign-in is unavailable.',503);
        const id = text(body.challengeId,100), code = text(body.code,100).replace(/\s/g,'');
        if (!uuid.test(id) || !/^\d{8}$/.test(code)) fail('Enter the eight-digit email code.',401);
        const client = await db.connect();
        try {
          await client.query('BEGIN');
          const found = await client.query('SELECT * FROM ml_owner_codes WHERE id=$1 AND expires_at>now() AND consumed_at IS NULL AND attempts<5 FOR UPDATE',[id]);
          const challenge = found.rows[0];
          const matching = challenge ? await client.query("SELECT id FROM ml_projects WHERE lower(trim(survey->>'email'))=$1 AND code_hash IS NOT NULL LIMIT 2",[challenge.email]) : {rows:[]};
          const verified = matching.rows.length === 1 && matches(ownerCodeHash(id,code),challenge.code_hash);
          if (challenge) await client.query('UPDATE ml_owner_codes SET attempts=attempts+1,consumed_at=CASE WHEN $2 THEN now() ELSE consumed_at END WHERE id=$1',[id,verified]);
          if (!verified) fail('Code incorrect or expired. Request a new code.',401);
          role='client'; projectId=matching.rows[0].id;
          await client.query('COMMIT');
        } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
      } else if (body.owner === true) {
        if (!ownerReady()) fail('Owner email sign-in is unavailable.', 503);
        const id = text(body.challengeId, 100), code = text(body.code, 100).replace(/\s/g, '');
        if (!uuid.test(id) || !/^\d{8}$/.test(code)) fail('Please enter the eight-digit email code.', 401);
        const client = await db.connect(); let verified = false;
        try {
          await client.query('BEGIN');
          const found = await client.query('SELECT * FROM ml_owner_codes WHERE id=$1 AND expires_at>now() AND consumed_at IS NULL AND attempts<5 FOR UPDATE', [id]);
          const challenge = found.rows[0];
          if (challenge && managerAuthorized(challenge.email)) {
            verified = matches(ownerCodeHash(id, code), challenge.code_hash);
            await client.query('UPDATE ml_owner_codes SET attempts=attempts+1,consumed_at=CASE WHEN $2 THEN now() ELSE consumed_at END WHERE id=$1', [id, verified]);
          }
          await client.query('COMMIT');
        } catch (error) { await client.query('ROLLBACK'); throw error; }
        finally { client.release(); }
        if (!verified) fail('This code is incorrect, expired or already used. Request a new sign-in code.', 401);
        role = 'admin';
      } else if (body.admin === true) {
        if (!process.env.PORTAL_ADMIN_PASSWORD || process.env.PORTAL_ADMIN_PASSWORD.length < 16) fail('The management login has not been configured yet.', 503);
        if (!matches(text(body.password, 500), process.env.PORTAL_ADMIN_PASSWORD)) fail('Please check your password.', 401);
        role = 'admin';
      } else {
        const code = normalizeCode(text(body.code, 100));
        const result = await db.query('SELECT id FROM ml_projects WHERE code_hash=$1', [hash(code)]);
        if (!result.rows[0]) fail('Please check your client code.', 401);
        role = 'client'; projectId = result.rows[0].id;
      }
      const token = randomBytes(32).toString('hex');
      await db.query("DELETE FROM ml_sessions WHERE expires_at<now()");
      await db.query("INSERT INTO ml_sessions(token_hash,role,project_id,expires_at) VALUES($1,$2,$3,now()+interval '12 hours')", [hash(token), role, projectId]);
      res.setHeader('Set-Cookie', cookie(token, 43200));
      return res.json({ role, projectId });
    }
    if (action === 'logout') {
      await db.query('DELETE FROM ml_sessions WHERE token_hash=$1', [hash(readToken(req))]);
      res.setHeader('Set-Cookie', cookie('', 0));
      return res.json({ ok: true });
    }
    const auth = await session(db, req);
    if (action === 'session') return res.json(auth);
    if (action === 'create-client') {
      if (auth.role !== 'admin') fail('Access denied.', 403);
      await rateLimit(db, req, 'create-client', 30);
      const survey = cleanClient(body);
      const projectId = randomUUID(), code = newCode();
      await db.query("INSERT INTO ml_projects(id,survey,code_hash,status) VALUES($1,$2,$3,'Designing')", [projectId, survey, hash(normalizeCode(code))]);
      const invitation = body.sendInvite === false ? { invitationStatus: 'skipped' } : await sendInvitation(survey, code, projectId);
      return res.status(201).json({ projectId, code, ...invitation });
    }
    if (action === 'projects') {
      if (auth.role !== 'admin') fail('Access denied.', 403);
      const result = await db.query(`SELECT id, survey->>'name' AS name, survey->>'eventTitle' AS title, survey->>'email' AS email,
        survey->>'eventDate' AS event_date, status, created_at, code_hash IS NOT NULL AS has_code FROM ml_projects ORDER BY created_at DESC`);
      return res.json({ projects: result.rows });
    }
    const project = await projectFor(db, auth, req.query.projectId || body.projectId);
    if (action === 'contract-file') {
      const id = String(req.query.documentId || '');
      if (!uuid.test(id)) fail('Document not found.',404);
      const result = await db.query('SELECT filename,mime_type,content FROM ml_contract_files WHERE id=$1 AND project_id=$2',[id,project.id]);
      if (!result.rows[0]) fail('Document not found.',404);
      const file = result.rows[0];
      res.setHeader('Content-Type',file.mime_type);
      res.setHeader('X-Content-Type-Options','nosniff');
      res.setHeader('Content-Disposition',`attachment; filename="${file.filename.replace(/[^a-zA-Z0-9._-]/g,'_')}"`);
      return res.status(200).send(file.content);
    }
    if (action === 'contract-upload') {
      await rateLimit(db,req,'contract-upload',20);
      const manager = auth.role === 'admin';
      const name = text(body.filename || '',180);
      const mime = text(body.mimeType || '',80);
      const permitted = manager ? ['application/pdf'] : ['application/pdf','image/jpeg','image/png'];
      if (!permitted.includes(mime) || !/^[a-zA-Z0-9 _().-]{1,180}$/.test(name)) fail('Please upload a PDF, or a signed PDF/photo for the client return.');
      const encoded = String(body.base64 || '');
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || encoded.length > 2800000) fail('File must be smaller than 2 MB. Please compress or scan your document.');
      const bytes = Buffer.from(encoded,'base64');
      if (!bytes.length || bytes.length > 2*1024*1024) fail('File must be smaller than 2 MB.');
      if (mime === 'application/pdf' && bytes.subarray(0,5).toString() !== '%PDF-') fail('Invalid PDF.');
      if (mime === 'image/png' && bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') fail('Invalid PNG.');
      if (mime === 'image/jpeg' && bytes.subarray(0,3).toString('hex') !== 'ffd8ff') fail('Invalid JPEG.');
      const client = await db.connect();
      let notificationContractId = null;
      try {
        await client.query('BEGIN');
        const latest = await client.query("SELECT id,version,status FROM ml_contracts WHERE project_id=$1 ORDER BY version DESC LIMIT 1 FOR UPDATE",[project.id]);
        if (manager) {
          const version = (latest.rows[0]?.version || 0)+1;
          await client.query("UPDATE ml_contracts SET status='Superseded' WHERE project_id=$1 AND status<>'Superseded'",[project.id]);
          const id = randomUUID();
          notificationContractId = id;
          await client.query("INSERT INTO ml_contracts(id,project_id,version,status) VALUES($1,$2,$3,'Awaiting Signature')",[id,project.id,version]);
          await client.query('INSERT INTO ml_contract_files(id,project_id,contract_id,kind,filename,mime_type,content) VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),project.id,id,'original',name,mime,bytes]);
        } else {
          const contract = latest.rows[0];
          notificationContractId = contract?.id;
          if (!contract || !['Awaiting Signature','Corrections Requested','Returned'].includes(contract.status)) fail('There is no contract ready for a signed return.',409);
          const count = await client.query("SELECT count(*)::int AS count FROM ml_contract_files WHERE contract_id=$1 AND kind='signed'",[contract.id]);
          if (count.rows[0].count >= 12) fail('Maximum of 12 signed pages. Please combine your pages into a PDF.');
          await client.query('INSERT INTO ml_contract_files(id,project_id,contract_id,kind,filename,mime_type,content) VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),project.id,contract.id,'signed',name,mime,bytes]);
          await client.query("UPDATE ml_contracts SET status='Returned',reviewed_at=NULL WHERE id=$1",[contract.id]);
        }
        await client.query('COMMIT');
      } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
      const notified = await contractNotification({kind: manager ? 'uploaded' : 'returned', survey: project.survey, projectId: project.id, contractId: notificationContractId});
      return res.json({ok:true, notificationSent:notified});
    }
    if (action === 'contract-review') {
      if (auth.role !== 'admin') fail('Only Maison Lucia can review signed contracts.',403);
      const status = body.status;
      if (!['Accepted','Corrections Requested'].includes(status) || !uuid.test(body.contractId || '')) fail('Invalid review.');
      const result = await db.query("UPDATE ml_contracts SET status=$1,reviewed_at=now() WHERE id=$2 AND project_id=$3 AND status='Returned' RETURNING id",[status,body.contractId,project.id]);
      if (!result.rows[0]) fail('A returned contract is required before review.',409);
      const notified = await contractNotification({kind: status === 'Accepted' ? 'accepted' : 'corrections', survey: project.survey, projectId: project.id, contractId: body.contractId});
      return res.json({ok:true, notificationSent:notified});
    }
    if (action === 'project') {
      const results = await Promise.all([
        db.query('SELECT * FROM ml_designs WHERE project_id=$1 ORDER BY created_at', [project.id]),
        db.query('SELECT * FROM ml_messages WHERE project_id=$1 ORDER BY created_at', [project.id]),
        db.query('SELECT * FROM ml_proposals WHERE project_id=$1 ORDER BY version DESC', [project.id]),
        db.query('SELECT * FROM ml_event_agreements WHERE project_id=$1 ORDER BY version DESC', [project.id]),
        db.query('SELECT id,version,status,created_at,reviewed_at FROM ml_contracts WHERE project_id=$1 ORDER BY version DESC',[project.id]),
        db.query('SELECT id,contract_id,kind,filename,mime_type,created_at FROM ml_contract_files WHERE project_id=$1 ORDER BY created_at',[project.id]),
      ]);
      return res.json({ project, designs: results[0].rows, messages: results[1].rows, proposals: results[2].rows, agreements: results[3].rows, contracts: results[4].rows, contractFiles: results[5].rows, role: auth.role });
    }
    if (action === 'details') {
      await rateLimit(db, req, 'event-details', 120);
      const revision = text(body.revision ?? '', 100);
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query('SELECT survey FROM ml_projects WHERE id=$1 FOR UPDATE', [project.id]);
        const current = result.rows[0].survey;
        if (!revision) fail('Please reload the event details before saving.', 409);
        if (revision !== hash(JSON.stringify(current))) {
          // Merge edits to different fields; reject conflicting edits to the same field.
          const changed = Object.keys(body.details || {});
          if (!body.base || changed.some(key => !fields.some(([field]) => field === key) || body.base[key] !== current[key]))
            fail('Someone else changed one of the same details. Your draft is kept. Load the latest details and review your change.', 409);
        }
        const survey = cleanEventDetails(body.details, current);
        survey.detailsUpdatedAt = new Date().toISOString();
        survey.detailsUpdatedBy = auth.role === 'admin' ? 'Maison Lucia' : 'Client';
        await client.query('UPDATE ml_projects SET survey=$1 WHERE id=$2', [survey, project.id]);
        if (hash(JSON.stringify(eventSnapshot(survey))) !== hash(JSON.stringify(eventSnapshot(current)))) await client.query("UPDATE ml_event_agreements SET status='Superseded' WHERE project_id=$1 AND status='Pending'", [project.id]);
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
      const saved = await projectFor(db, auth, project.id);
      return res.json({ ok: true, project: saved });
    }
    if (action === 'event-agreement' || action === 'sign-event') {
      if (action === 'event-agreement' && auth.role !== 'admin') fail('Only Maison Lucia can prepare the event agreement.', 403);
      if (action === 'sign-event' && auth.role !== 'client') fail('Only the client can sign the event agreement.', 403);
      await rateLimit(db, req, action, 30);
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const locked = await client.query('SELECT survey FROM ml_projects WHERE id=$1 FOR UPDATE', [project.id]);
        const survey = locked.rows[0].survey, snapshot = eventSnapshot(survey);
        if (action === 'event-agreement') {
          if (body.revision !== hash(JSON.stringify(survey))) fail('The details changed. Refresh and review them before preparing the agreement.', 409);
          if (!snapshot.name || !snapshot.eventTitle || !snapshot.services || snapshot.services === 'Details to be discussed in the portal.') fail('Add the client name, event title and requested services before preparing the event agreement.');
          const version = await client.query('SELECT coalesce(max(version),0)+1 AS version FROM ml_event_agreements WHERE project_id=$1', [project.id]);
          await client.query("UPDATE ml_event_agreements SET status='Superseded' WHERE project_id=$1 AND status='Pending'", [project.id]);
          await client.query('INSERT INTO ml_event_agreements(id,project_id,version,snapshot) VALUES($1,$2,$3,$4)', [randomUUID(),project.id,version.rows[0].version,snapshot]);
        } else {
          const name = text(body.name ?? '',250);
          if (!name || body.confirm !== true || !uuid.test(body.agreementId || '')) fail('Enter your full name and confirm the event details.');
          const result = await client.query('SELECT * FROM ml_event_agreements WHERE id=$1 AND project_id=$2 FOR UPDATE', [body.agreementId,project.id]);
          const agreement = result.rows[0];
          if (!agreement || agreement.status === 'Superseded' || hash(JSON.stringify(eventSnapshot(agreement.snapshot))) !== hash(JSON.stringify(snapshot))) fail('The event details changed. Ask Maison Lucia to prepare the updated agreement before signing.',409);
          if (agreement.status === 'Pending') await client.query("UPDATE ml_event_agreements SET status='Signed',signed_by=$1,signed_email=$2,signed_at=now() WHERE id=$3", [name,survey.email,agreement.id]);
        }
        await client.query('COMMIT');
      } catch(error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
      return res.json({ok:true});
    }
    if (action === 'event-task') {
      if (auth.role !== 'admin') fail('Only Maison Lucia can update the working checklist.',403);
      if (!uuid.test(body.agreementId || '') || !fields.some(([key]) => key === body.field) || typeof body.done !== 'boolean') fail('Please check the working-list item.');
      // Atomic add/remove avoids losing checkmarks from another owner tab.
      const result = await db.query(`UPDATE ml_event_agreements SET completed_fields=(SELECT coalesce(jsonb_agg(value),'[]'::jsonb) FROM
        (SELECT DISTINCT value FROM jsonb_array_elements_text(completed_fields || CASE WHEN $3 THEN jsonb_build_array($2::text) ELSE '[]'::jsonb END) WHERE $3 OR value<>$2) items)
        WHERE id=$1 AND project_id=$4 AND status<>'Superseded' RETURNING id`, [body.agreementId,body.field,body.done,project.id]);
      if (!result.rows[0]) fail('This working list is no longer current. Refresh the event.',409);
      return res.json({ok:true});
    }
    if (action === 'message') {
      await rateLimit(db, req, 'message', 100);
      const message = text(body.message ?? '', 5000);
      const images = cleanImages(body.images || []);
      if (!message && !images.length) fail('Write a message or attach an image first.');
      let designId = body.designId || null;
      if (designId) {
        if (!uuid.test(designId)) fail('Design not found.', 404);
        const result = await db.query('SELECT id FROM ml_designs WHERE id=$1 AND project_id=$2', [designId, project.id]);
        if (!result.rows[0]) fail('Design not found.', 404);
      }
      await db.query('INSERT INTO ml_messages(id,project_id,design_id,role,body,images) VALUES($1,$2,$3,$4,$5,$6)', [randomUUID(), project.id, designId, auth.role, message, JSON.stringify(images)]);
      return res.status(201).json({ ok: true });
    }
    if (action === 'approve') {
      if (auth.role !== 'client') fail('Only the client can approve a proposal.', 403);
      const name = text(body.name, 250);
      if (!name || body.confirm !== true || !uuid.test(body.proposalId || '')) fail('Enter your name and confirm the proposal.');
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT id FROM ml_projects WHERE id=$1 FOR UPDATE', [project.id]);
        const result = await client.query('SELECT * FROM ml_proposals WHERE id=$1 AND project_id=$2 FOR UPDATE', [body.proposalId, project.id]);
        const proposal = result.rows[0];
        if (!proposal || proposal.status === 'Superseded') fail('This proposal has been revised. Refresh and review the latest version.', 409);
        if (proposal.status === 'Pending') {
          const invoiceNumber = `ML-${new Date().getUTCFullYear()}-${randomBytes(10).toString('hex').toUpperCase()}`;
          await client.query("UPDATE ml_proposals SET status='Approved',approved_by=$1,approved_at=now(),invoice_number=$2 WHERE id=$3", [name, invoiceNumber, proposal.id]);
          await client.query("UPDATE ml_projects SET status='Approved' WHERE id=$1", [project.id]);
        }
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
      return res.json({ ok: true });
    }
    if (auth.role !== 'admin') fail('Access denied.', 403);
    if (action === 'email-code') {
      await rateLimit(db, req, 'email-code', 30);
      const code = text(body.code, 100);
      const match = await db.query('SELECT id FROM ml_projects WHERE id=$1 AND code_hash=$2', [project.id, hash(normalizeCode(code))]);
      if (!match.rows[0]) fail('This code has been replaced. Create a new client code before emailing it.', 409);
      return res.json(await sendInvitation(project.survey, code, project.id));
    }
    if (action === 'code') {
      await rateLimit(db, req, 'issue-code', 30);
      const code = newCode();
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query('UPDATE ml_projects SET code_hash=$1, status=CASE WHEN status=\'Inquiry\' THEN \'Designing\' ELSE status END WHERE id=$2', [hash(normalizeCode(code)), project.id]);
        await client.query('DELETE FROM ml_sessions WHERE project_id=$1', [project.id]);
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
      const invitation = body.sendInvite === false ? { invitationStatus: 'skipped' } : await sendInvitation(project.survey, code, project.id);
      return res.json({ code, ...invitation });
    }
    if (action === 'design') {
      const title = text(body.title, 250), description = text(body.description, 5000);
      if (!title || !description) fail('Add a design title and description.');
      await db.query('INSERT INTO ml_designs(id,project_id,title,description,images) VALUES($1,$2,$3,$4,$5)', [randomUUID(), project.id, title, description, JSON.stringify(cleanImages(body.images || []))]);
      return res.status(201).json({ ok: true });
    }
    if (action === 'proposal') {
      const details = cleanProposal(body);
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const locked = await client.query('SELECT survey FROM ml_projects WHERE id=$1 FOR UPDATE', [project.id]);
        const signed = await client.query("SELECT snapshot FROM ml_event_agreements WHERE project_id=$1 AND status='Signed' ORDER BY version DESC", [project.id]);
        const latestPlan = hash(JSON.stringify(eventSnapshot(locked.rows[0].survey)));
        if (!signed.rows.some(item => hash(JSON.stringify(eventSnapshot(item.snapshot))) === latestPlan)) fail('The client must sign the current event agreement before Maison Lucia shares a pricing proposal.',409);
        const result = await client.query('SELECT coalesce(max(version),0)+1 AS version FROM ml_proposals WHERE project_id=$1', [project.id]);
        await client.query("UPDATE ml_proposals SET status='Superseded' WHERE project_id=$1 AND status='Pending'", [project.id]);
        await client.query('INSERT INTO ml_proposals(id,project_id,version,details) VALUES($1,$2,$3,$4)', [randomUUID(), project.id, result.rows[0].version, details]);
        await client.query("UPDATE ml_projects SET status='Proposal ready' WHERE id=$1", [project.id]);
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
      return res.status(201).json({ ok: true });
    }
    fail('Not found.', 404);
  } catch (error) {
    if (!error.status) console.error('Maison Lucia portal request failed:', error.code || error.name);
    res.status(error.status || 503).json({ error: error.status ? error.message : 'The portal is temporarily unavailable. Please try again or contact Maison Lucia.' });
  }
}
export const config = { api: { bodyParser: { sizeLimit: '3mb' } } };
