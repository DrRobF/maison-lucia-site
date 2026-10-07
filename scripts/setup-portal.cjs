const fs = require('node:fs');
const path = require('node:path');
const { database } = require('../lib/portal-db');
(async () => {
  const pool = database();
  try { await pool.query(fs.readFileSync(path.join(__dirname, 'portal-schema.sql'), 'utf8')); console.log('Maison Lucia portal tables are ready.'); }
  finally { await pool.end(); }
})().catch(() => { console.error('Portal setup failed. Check DATABASE_URL and database access.'); process.exitCode = 1; });
