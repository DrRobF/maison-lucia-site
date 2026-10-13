const { createHash } = require('node:crypto');
const portalUrl = 'https://www.maisonluciallc.com/portal';
const invitationSubject = 'Your Maison Lucia client portal';
function invitationsReady(env = process.env) {
  return Boolean(env.RESEND_API_KEY && env.PORTAL_INVITE_FROM && env.PORTAL_INVITES_ENABLED === 'true');
}
function invitationText(survey, code) {
  return `Hello${survey.name && survey.name !== survey.email ? ` ${survey.name}` : ''},\n\nYour private Maison Lucia portal is ready.\n\nOpen ${portalUrl}\nClient code: ${code}\n\nUse your code to exchange messages and photos, review design ideas, and approve your proposal. You do not need to complete a questionnaire to get started. Keep this code private. Please send replies through your portal.\n\nMaison Lucia`;
}
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
async function sendInvitation(survey, code, projectId, { env = process.env, request = fetch } = {}) {
  if (!invitationsReady(env)) return { invitationStatus: 'not_configured' };
  const payload = {
    from: env.PORTAL_INVITE_FROM, to: [survey.email], subject: invitationSubject,
    text: invitationText(survey, code),
    html: `<h1>Your Maison Lucia portal is ready</h1><p>Hello${survey.name && survey.name !== survey.email ? ` ${escapeHtml(survey.name)}` : ''},</p><p>Exchange messages and photos, explore design ideas, and review your proposal. No questionnaire is required.</p><p><a href="${portalUrl}">Open your client portal</a></p><p>Your private client code:</p><p style="font-family:monospace;font-size:18px">${escapeHtml(code)}</p><p>Keep this code private. Please send replies through your portal.</p><p>Maison Lucia</p>`,
  };
  const idempotencyKey = `portal-invitation/${projectId}/${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`;
  try {
    const response = await request('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(8000),
    });
    const result = await response.json();
    // Accepted by the provider is not proof of inbox delivery. Never echo errors or secrets.
    return { invitationStatus: response.ok && result.id ? 'accepted' : 'failed' };
  } catch { return { invitationStatus: 'failed' }; }
}
module.exports = { invitationsReady, invitationText, invitationSubject, sendInvitation };
