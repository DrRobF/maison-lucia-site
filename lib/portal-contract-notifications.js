const { invitationsReady } = require('./portal-invitations');
const clientUrl = 'https://www.maisonluciallc.com/portal';
const managerUrl = 'https://www.maisonluciallc.com/portal/manage';
function managerRecipients(env = process.env) {
  return [...new Set([env.PORTAL_OWNER_EMAIL, ...(env.PORTAL_MANAGER_EMAILS || '').split(',')].map(x => String(x || '').trim().toLowerCase()).filter(x => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)))];
}
async function contractNotification({ kind, survey, projectId, contractId, env = process.env, request = fetch }) {
  if (!invitationsReady(env)) return false;
  const email = String(survey?.email || '').trim().toLowerCase();
  const recipients = kind === 'returned' ? managerRecipients(env) : [email];
  if (!recipients.length || recipients.some(x => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))) return false;
  const content = {
    uploaded: ['A contract is ready for your review', 'Maison Lucia has uploaded a contract for your event. Please sign in to review and return the signed document.', clientUrl],
    returned: ['A signed contract was returned', 'A client has returned a signed contract. Sign in to review it.', managerUrl],
    accepted: ['Your contract has been accepted', 'Maison Lucia has reviewed and accepted your returned contract. Sign in to view its status.', clientUrl],
    corrections: ['Your contract needs corrections', 'Maison Lucia reviewed your returned contract and requested corrections. Sign in to review and submit an updated document.', clientUrl],
  }[kind];
  if (!content) return false;
  const [subject, message, url] = content;
  try {
    const response = await request('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.PORTAL_INVITE_FROM, to: recipients, subject: `Maison Lucia: ${subject}`,
        text: `${message}\n\nOpen your private portal: ${url}\n\nFor your security, the contract is not attached to this email.\n\nMaison Lucia` }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch { return false; }
}
module.exports = { contractNotification, managerRecipients };
