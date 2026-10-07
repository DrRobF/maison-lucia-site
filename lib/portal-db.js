const { Pool } = require('pg');
let pool;
function database() {
  if (!process.env.DATABASE_URL) { const error = new Error('The client portal is being prepared. Please contact Maison Lucia directly for now.'); error.status = 503; throw error; }
  if (!pool) {
    let connectionString = process.env.DATABASE_URL;
    const url = new URL(connectionString);
    const supabase = url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.com');
    let ssl;
    if (supabase || process.env.DATABASE_CA_CERT) {
      // Connection-string SSL flags override pg's explicit TLS configuration.
      // Keep provider certificate verification enabled, including pasted URLs.
      for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat']) url.searchParams.delete(key);
      connectionString = url.toString();
      ssl = { rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n') } : {}) };
    }
    pool = new Pool({ connectionString, ...(ssl ? { ssl } : {}), max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
  }
  return pool;
}
module.exports = { database };
