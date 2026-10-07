const { Pool } = require('pg');
let pool;
function database() {
  if (!process.env.DATABASE_URL) { const error = new Error('The client portal is being prepared. Please contact Maison Lucia directly for now.'); error.status = 503; throw error; }
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
  return pool;
}
module.exports = { database };
