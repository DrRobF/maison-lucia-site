const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { PGlite } = require('@electric-sql/pglite');
const { cleanSurvey, cleanProposal, normalizeCode } = require('../lib/portal-model');

test('questionnaire and financial validation reject malformed inputs', () => {
  assert.throws(() => cleanSurvey({ name: 'A', email: 'bad', eventTitle: 'Party', services: 'Florals' }));
  assert.throws(() => cleanSurvey({ name: 'A', email: 'a@b.co', eventTitle: 'Party', services: 'Florals', tableCount: '-1' }));
  assert.throws(() => cleanProposal({ items: [{ description: 'Flowers', quantity: 1, price: '' }] }));
  assert.throws(() => cleanProposal({ items: [{ description: 'Flowers', quantity: 1, price: -5 }] }));
  const proposal = cleanProposal({ items: [{ description: 'Centerpiece', quantity: 3, price: 19.95 }], extra: 5 });
  assert.equal(proposal.totalCents, 6485);
  assert.equal(normalizeCode('ab cd-12'), 'ABCD12');
});

test('Supabase database URLs require verified TLS, including pasted SSL flags', () => {
  const source = fs.readFileSync(path.join(__dirname, '../lib/portal-db.js'), 'utf8');
  const context = { URL, module: { exports: {} }, process: { env: {
    DATABASE_URL: 'postgresql://test:test@pool.pooler.supabase.com:6543/postgres?sslmode=no-verify',
    DATABASE_CA_CERT: 'test-ca\\nnext-line',
  } }, require: () => ({ Pool: class { constructor(options) { this.options = options; } } }) };
  vm.runInNewContext(source, context);
  const options = context.module.exports.database().options;
  assert.equal(options.ssl.rejectUnauthorized, true);
  assert.equal(options.ssl.ca, 'test-ca\nnext-line');
  assert.equal(new URL(options.connectionString).searchParams.has('sslmode'), false);
});

test('private portal end-to-end PostgreSQL workflow and authorization', async () => {
  const pg = new PGlite();
  await pg.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
  await pg.exec(fs.readFileSync(path.join(__dirname, '../scripts/portal-schema.sql'), 'utf8'));
  const security = await pg.query("SELECT relname, relrowsecurity FROM pg_class WHERE relname LIKE 'ml_%' AND relkind='r'");
  assert.equal(security.rows.length, 6);
  assert.ok(security.rows.every(table => table.relrowsecurity));
  const grants = await pg.query("SELECT has_table_privilege('anon','ml_projects','SELECT') AS anon_read, has_table_privilege('authenticated','ml_sessions','SELECT') AS client_sessions");
  assert.equal(grants.rows[0].anon_read, false);
  assert.equal(grants.rows[0].client_sessions, false);
  const db = { query: (...args) => pg.query(...args), connect: async () => ({ query: (...args) => pg.query(...args), release() {} }) };
  const filename = path.join(__dirname, '../pages/api/portal/[action].js');
  const originalRequire = createRequire(filename);
  const context = { require: name => name === '../../../lib/portal-db' ? { database: () => db } : originalRequire(name), module: { exports: {} }, process: { env: { PORTAL_ADMIN_PASSWORD: 'test-only-long-password' } }, console, URL, AbortSignal, fetch };
  const source = fs.readFileSync(filename, 'utf8').replace('export default async function handler', 'async function handler').replace(/export const config =[^\n]+/, 'module.exports = handler;');
  vm.runInNewContext(source, context, { filename });
  const handler = context.module.exports;
  let ip = 0;
  async function call(action, body, session = '', projectId, origin) {
    let result, status = 200; const headers = {};
    const req = { method: body === undefined ? 'GET' : 'POST', query: { action, projectId }, body, socket: { remoteAddress: `127.0.0.${++ip}` }, headers: { host: 'maison.test', cookie: session, 'content-type': 'application/json', ...(origin ? { origin } : {}) } };
    const res = { setHeader(key, value) { headers[key] = value; }, status(value) { status = value; return this; }, json(value) { result = value; return this; } };
    await handler(req, res);
    return { status, result, headers, cookie: headers['Set-Cookie']?.split(';')[0] };
  }
  try {
    assert.equal((await call('projects')).status, 401);
    assert.equal((await call('login', { admin: true, password: 'test-only-long-password' }, '', null, 'https://evil.test')).status, 403);
    assert.equal((await call('login', { admin: true, password: 'wrong' })).status, 401);
    const admin = await call('login', { admin: true, password: 'test-only-long-password' });
    assert.equal(admin.status, 200); assert.match(admin.headers['Set-Cookie'], /HttpOnly/);
    for (const title of ['First event', 'Second event']) {
      const result = await call('inquiry', { survey: { name: 'Client', email: 'client@example.com', eventTitle: title, services: 'Tables and florals', tableCount: '10' } });
      assert.equal(result.status, 201); assert.equal(result.result.saved, true);
    }
    const list = await call('projects', undefined, admin.cookie);
    const first = list.result.projects.find(item => item.title === 'First event').id;
    const second = list.result.projects.find(item => item.title === 'Second event').id;
    const issued = await call('code', { projectId: first }, admin.cookie);
    const client = await call('login', { code: issued.result.code });
    assert.equal(client.status, 200);
    assert.equal((await call('projects', undefined, client.cookie)).status, 403);
    assert.equal((await call('project', undefined, client.cookie, second)).status, 403);
    assert.equal((await call('project', undefined, client.cookie)).result.project.id, first);
    const design = await call('design', { projectId: first, title: 'Low garden florals', description: 'Conversation-friendly arrangements', images: [] }, admin.cookie);
    assert.equal(design.status, 201);
    await call('design', { projectId: second, title: 'Other client design', description: 'Private', images: [] }, admin.cookie);
    let own = (await call('project', undefined, client.cookie)).result;
    assert.equal(own.designs.length, 1);
    const other = (await call('project', undefined, admin.cookie, second)).result;
    assert.equal((await call('message', { projectId: second, designId: other.designs[0].id, message: 'Trying cross-client access' }, client.cookie)).status, 403);
    assert.equal((await call('message', { projectId: first, designId: other.designs[0].id, message: 'Trying another design' }, client.cookie)).status, 404);
    assert.equal((await call('message', { projectId: first, designId: own.designs[0].id, message: 'Can we use blue?' }, client.cookie)).status, 201);
    assert.equal((await call('design', { projectId: first, title: 'Unauthorized', description: 'No' }, client.cookie)).status, 403);
    const draft = { projectId: first, title: 'Tablescape', items: [{ description: 'Centerpieces', quantity: 10, price: 45.5 }], terms: 'Setup included. Payment arranged offline.' };
    assert.equal((await call('proposal', draft, admin.cookie)).status, 201);
    own = (await call('project', undefined, client.cookie)).result;
    const oldProposal = own.proposals[0];
    assert.equal((await call('approve', { projectId: first, proposalId: oldProposal.id, name: 'Manager', confirm: true }, admin.cookie)).status, 403);
    await call('proposal', { ...draft, items: [{ description: 'Revised centerpieces', quantity: 10, price: 50 }] }, admin.cookie);
    assert.equal((await call('approve', { proposalId: oldProposal.id, name: 'Client', confirm: true }, client.cookie)).status, 409);
    own = (await call('project', undefined, client.cookie)).result;
    const pending = own.proposals[0];
    assert.equal((await call('approve', { proposalId: pending.id, name: 'Client', confirm: false }, client.cookie)).status, 400);
    assert.equal((await call('approve', { proposalId: pending.id, name: 'Client', confirm: true }, client.cookie)).status, 200);
    const invoice = (await call('project', undefined, client.cookie)).result.proposals[0];
    assert.equal(invoice.status, 'Approved'); assert.equal(invoice.approved_by, 'Client'); assert.ok(invoice.invoice_number); assert.equal(invoice.details.totalCents, 50000);
    await call('approve', { proposalId: pending.id, name: 'Changed name', confirm: true }, client.cookie);
    const repeated = (await call('project', undefined, client.cookie)).result.proposals[0];
    assert.equal(repeated.invoice_number, invoice.invoice_number); assert.equal(repeated.approved_by, 'Client');
    await call('proposal', { ...draft, title: 'Another revision' }, admin.cookie);
    own = (await call('project', undefined, client.cookie)).result;
    const preserved = own.proposals.find(item => item.id === invoice.id);
    assert.equal(preserved.details.totalCents, 50000); assert.equal(preserved.status, 'Approved');
    assert.equal(own.proposals.filter(item => item.status === 'Pending').length, 1);
    await call('code', { projectId: first }, admin.cookie);
    assert.equal((await call('project', undefined, client.cookie)).status, 401);
    assert.equal((await call('login', { code: issued.result.code })).status, 401);
    assert.equal((await call('logout', {}, admin.cookie)).status, 200);
    assert.equal((await call('projects', undefined, admin.cookie)).status, 401);
  } finally { await pg.close(); }
});
