const { randomUUID, randomBytes } = require('node:crypto');
const { database } = require('../../../lib/portal-db');
const { fields, fail, text, cleanSurvey, cleanImages, cleanProposal, hash, matches, newCode, normalizeCode } = require('../../../lib/portal-model');
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
  return result.rows[0];
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
  const reads = ['session', 'projects', 'project', 'ready'];
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
      if (!configured) return res.json({ ready: false, configured: false });
      try {
        await database().query('SELECT id FROM ml_projects LIMIT 0');
        return res.json({ ready: true, configured: true });
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
    if (action === 'login') {
      await rateLimit(db, req, 'login', 10);
      let role, projectId = null;
      if (body.admin === true) {
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
    if (action === 'projects') {
      if (auth.role !== 'admin') fail('Access denied.', 403);
      const result = await db.query(`SELECT id, survey->>'name' AS name, survey->>'eventTitle' AS title, survey->>'email' AS email,
        survey->>'eventDate' AS event_date, status, created_at, code_hash IS NOT NULL AS has_code FROM ml_projects ORDER BY created_at DESC`);
      return res.json({ projects: result.rows });
    }
    const project = await projectFor(db, auth, req.query.projectId || body.projectId);
    if (action === 'project') {
      const results = await Promise.all([
        db.query('SELECT * FROM ml_designs WHERE project_id=$1 ORDER BY created_at', [project.id]),
        db.query('SELECT * FROM ml_messages WHERE project_id=$1 ORDER BY created_at', [project.id]),
        db.query('SELECT * FROM ml_proposals WHERE project_id=$1 ORDER BY version DESC', [project.id]),
      ]);
      return res.json({ project, designs: results[0].rows, messages: results[1].rows, proposals: results[2].rows, role: auth.role });
    }
    if (action === 'message') {
      await rateLimit(db, req, 'message', 100);
      const message = text(body.message, 5000);
      if (!message) fail('Write a message first.');
      let designId = body.designId || null;
      if (designId) {
        if (!uuid.test(designId)) fail('Design not found.', 404);
        const result = await db.query('SELECT id FROM ml_designs WHERE id=$1 AND project_id=$2', [designId, project.id]);
        if (!result.rows[0]) fail('Design not found.', 404);
      }
      await db.query('INSERT INTO ml_messages(id,project_id,design_id,role,body) VALUES($1,$2,$3,$4,$5)', [randomUUID(), project.id, designId, auth.role, message]);
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
    if (action === 'code') {
      const code = newCode();
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query('UPDATE ml_projects SET code_hash=$1, status=CASE WHEN status=\'Inquiry\' THEN \'Designing\' ELSE status END WHERE id=$2', [hash(normalizeCode(code)), project.id]);
        await client.query('DELETE FROM ml_sessions WHERE project_id=$1', [project.id]);
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
      return res.json({ code });
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
        await client.query('SELECT id FROM ml_projects WHERE id=$1 FOR UPDATE', [project.id]);
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
