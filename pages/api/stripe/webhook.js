const { database } = require('../../../lib/portal-db');
const { stripeClient, reconcileEvent } = require('../../../lib/portal-payments');

export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  let stripe;
  try { stripe = stripeClient(); } catch { return res.status(503).json({ error:'Stripe test connection is awaiting setup.' }); }
  let event;
  try {
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 1048576) return res.status(413).end(); chunks.push(chunk); }
    event = stripe.webhooks.constructEvent(Buffer.concat(chunks),req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET);
  } catch { return res.status(400).json({ error:'Invalid webhook signature.' }); }
  try { await reconcileEvent(database(),event,stripe); return res.json({ received:true }); }
  catch(error) { console.error('Stripe test webhook failed:',error.code || error.name); return res.status(error.status === 400 ? 400 : 503).json({ error:'Unable to reconcile test event.' }); }
}
export const config = { api: { bodyParser: false } };
