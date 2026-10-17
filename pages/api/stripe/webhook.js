const { database } = require('../../../lib/portal-db');
const { stripeClient, signingSecret, reconcileEvent } = require('../../../lib/portal-payments');

export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  let stripe, event;
  try {
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 1048576) return res.status(413).end(); chunks.push(chunk); }
    const payload = Buffer.concat(chunks);
    // The unverified mode selects a candidate secret only. Nothing is processed
    // until Stripe verifies the complete raw payload with that mode's secret.
    const candidate = JSON.parse(payload.toString('utf8'));
    if (typeof candidate.livemode !== 'boolean') return res.status(400).json({error:'Stripe event mode is missing.'});
    const mode = candidate.livemode ? 'live' : 'test';
    try { stripe = stripeClient(process.env,mode); }
    catch { return res.status(503).json({error:'Stripe connection is awaiting setup for this event mode.'}); }
    event = stripe.webhooks.constructEvent(payload,req.headers['stripe-signature'],signingSecret(process.env,mode));
  } catch { return res.status(400).json({ error:'Invalid webhook signature.' }); }
  try { await reconcileEvent(database(),event,stripe); return res.json({ received:true }); }
  catch(error) { console.error('Stripe webhook failed:',error.code || error.name); return res.status(error.status === 400 ? 400 : 503).json({ error:'Unable to reconcile payment event.' }); }
}
export const config = { api: { bodyParser: false } };
