const { randomInt, createHmac } = require('node:crypto');
const { invitationsReady } = require('./portal-invitations');
function ownerEmail(env = process.env) { return String(env.PORTAL_OWNER_EMAIL || '').trim().toLowerCase(); }
function authorizedManagerEmails(env = process.env) {
  return [ownerEmail(env), ...String(env.PORTAL_MANAGER_EMAILS || '').split(',').map(email => email.trim().toLowerCase())].filter(Boolean);
}
function managerAuthorized(email, env = process.env) {
  return authorizedManagerEmails(env).includes(String(email || '').trim().toLowerCase());
}
function ownerReady(env = process.env) { return Boolean(ownerEmail(env) && env.PORTAL_OWNER_CODE_SECRET?.length >= 32 && invitationsReady(env)); }
function ownerCodeHash(id, code, env = process.env) { return createHmac('sha256', env.PORTAL_OWNER_CODE_SECRET).update(`${id}:${code}`).digest('hex'); }
function newOwnerCode() { return String(randomInt(0, 100000000)).padStart(8, '0'); }
async function sendOwnerCode(code, id, { env = process.env, request = fetch, email = ownerEmail(env) } = {}) {
  if (!ownerReady(env) || !managerAuthorized(email,env)) return false;
  try {
    const response = await request('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `owner-sign-in/${id}` },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ from: env.PORTAL_INVITE_FROM, to: [email], subject: 'Your Maison Lucia owner sign-in code',
        text: `Your owner sign-in code is ${code}.\n\nEnter it at https://www.maisonluciallc.com/portal/manage. It expires in 10 minutes and can be used once.\n\nKeep this code private. If you did not request it, ignore this email.\n\nMaison Lucia` }),
    });
    const result = await response.json(); return Boolean(response.ok && result.id);
  } catch { return false; }
}
module.exports = { ownerEmail, managerAuthorized, ownerReady, ownerCodeHash, newOwnerCode, sendOwnerCode };
