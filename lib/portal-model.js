const { randomBytes, createHash, timingSafeEqual } = require('node:crypto');

const { fields } = require('./portal-fields');

function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function text(value, max = 3000) { if (typeof value !== 'string' || value.length > max) fail('Please check the length and format of your entry.'); return value.trim(); }
function cleanSurvey(input) {
  if (!input || typeof input !== 'object') fail('Please complete the questionnaire.');
  const result = {};
  for (const [key, label, type, required, options] of fields) {
    const value = text(input[key] ?? '', type === 'textarea' ? 3000 : 250);
    if (required && !value) fail(`${label} is required.`);
    if (type === 'number' && value && (!/^\d+$/.test(value) || Number(value) > 100000)) fail(`Please check ${label.toLowerCase()}.`);
    if (options && value && !options.includes(value)) fail(`Please check ${label.toLowerCase()}.`);
    if (type === 'date' && value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)))) fail('Please check the event date.');
    result[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) fail('Please enter a valid email address.');
  result.images = cleanImages(input.images || []);
  return result;
}
function cleanImages(images) {
  if (!Array.isArray(images) || images.length > 3) fail('Please choose up to three images.');
  return images.map(image => {
    if (typeof image !== 'string' || image.length > 700000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(image)) fail('Use a JPG, PNG, or WebP image under 500 KB.');
    return image;
  });
}
function cleanProposal(input) {
  if (!input || !Array.isArray(input.items) || !input.items.length || input.items.length > 50) fail('Add at least one proposal item (up to 50).');
  const items = input.items.map(item => {
    const description = text(item.description, 500);
    const quantity = Number(item.quantity);
    const rawPrice = Number(item.price);
    if (item.quantity === '' || item.price === '' || item.quantity == null || item.price == null) fail('Enter a quantity and price for each item.');
    if (!description || !Number.isFinite(quantity) || quantity <= 0 || quantity > 100000 || !Number.isFinite(rawPrice) || rawPrice < 0 || rawPrice > 1000000) fail('Please check each item description, quantity, and price.');
    const unitCents = Math.round(rawPrice * 100);
    return { description, quantity, unitCents, totalCents: Math.round(quantity * unitCents) };
  });
  const extraCents = Math.round(Number(input.extra || 0) * 100);
  if (!Number.isSafeInteger(extraCents) || extraCents < 0 || extraCents > 100000000) fail('Please check the additional charges.');
  const totalCents = items.reduce((sum, item) => sum + item.totalCents, extraCents);
  if (!Number.isSafeInteger(totalCents) || totalCents > 1000000000) fail('Proposal total is too large.');
  return { title: text(input.title || '', 250) || 'Event styling proposal', items, extraCents, extraLabel: text(input.extraLabel || 'Additional charges', 250), totalCents, terms: text(input.terms || '', 8000), currency: 'USD' };
}
function hash(value) { return createHash('sha256').update(String(value)).digest('hex'); }
function matches(a, b) { return timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b))); }
function newCode() { return randomBytes(16).toString('hex').toUpperCase().match(/.{1,4}/g).join('-'); }
function normalizeCode(value) { return String(value || '').replace(/[\s-]/g, '').toUpperCase(); }
module.exports = { fields, fail, text, cleanSurvey, cleanImages, cleanProposal, hash, matches, newCode, normalizeCode };
