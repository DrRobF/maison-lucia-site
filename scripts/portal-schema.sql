CREATE TABLE IF NOT EXISTS ml_projects (
  id uuid PRIMARY KEY,
  survey jsonb NOT NULL,
  code_hash text UNIQUE,
  status text NOT NULL DEFAULT 'Inquiry',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ml_sessions (
  token_hash text PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('admin','client')),
  project_id uuid REFERENCES ml_projects(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS ml_designs (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES ml_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  images jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ml_messages (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES ml_projects(id) ON DELETE CASCADE,
  design_id uuid REFERENCES ml_designs(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','client')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Upgrade existing portals as well as new installations.
ALTER TABLE ml_messages ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE TABLE IF NOT EXISTS ml_proposals (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES ml_projects(id) ON DELETE CASCADE,
  version integer NOT NULL,
  details jsonb NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Superseded')),
  approved_by text,
  approved_at timestamptz,
  invoice_number text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, version)
);
CREATE TABLE IF NOT EXISTS ml_rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS ml_designs_project ON ml_designs(project_id);
CREATE INDEX IF NOT EXISTS ml_messages_project ON ml_messages(project_id, created_at);
CREATE INDEX IF NOT EXISTS ml_proposals_project ON ml_proposals(project_id, version);
CREATE UNIQUE INDEX IF NOT EXISTS ml_one_pending_proposal ON ml_proposals(project_id) WHERE status = 'Pending';
CREATE INDEX IF NOT EXISTS ml_sessions_project ON ml_sessions(project_id);
CREATE INDEX IF NOT EXISTS ml_sessions_expiry ON ml_sessions(expires_at);
CREATE INDEX IF NOT EXISTS ml_messages_design ON ml_messages(design_id);

-- These records are accessed through the site's authorized server APIs, never
-- through Supabase's browser Data API. No public-client RLS policies are added.
ALTER TABLE ml_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ml_projects, ml_sessions, ml_designs, ml_messages, ml_proposals, ml_rate_limits FROM PUBLIC;
-- Preserve portability to ordinary PostgreSQL installations without these roles.
DO $security$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON TABLE ml_projects, ml_sessions, ml_designs, ml_messages, ml_proposals, ml_rate_limits FROM %I', role_name);
    END IF;
  END LOOP;
END
$security$;

CREATE TABLE IF NOT EXISTS ml_owner_codes (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ml_owner_codes_expiry ON ml_owner_codes(expires_at);
ALTER TABLE ml_owner_codes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ml_owner_codes FROM PUBLIC;
DO $security$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON TABLE ml_owner_codes FROM %I', role_name);
    END IF;
  END LOOP;
END
$security$;

CREATE TABLE IF NOT EXISTS ml_event_agreements (
 id uuid PRIMARY KEY,
 project_id uuid NOT NULL REFERENCES ml_projects(id) ON DELETE CASCADE,
 version integer NOT NULL,
 snapshot jsonb NOT NULL,
 status text NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Signed','Superseded')),
 signed_by text,
 signed_email text,
 signed_at timestamptz,
 completed_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(project_id,version)
);
CREATE INDEX IF NOT EXISTS ml_event_agreements_project ON ml_event_agreements(project_id,version);
CREATE UNIQUE INDEX IF NOT EXISTS ml_one_pending_event_agreement ON ml_event_agreements(project_id) WHERE status='Pending';
ALTER TABLE ml_event_agreements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ml_event_agreements FROM PUBLIC;
DO $security$
DECLARE role_name text;
BEGIN
 FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname=role_name) THEN
   EXECUTE format('REVOKE ALL ON TABLE ml_event_agreements FROM %I',role_name);
  END IF;
 END LOOP;
END
$security$;


-- Hand-signed contract workflow; content is stored privately in PostgreSQL.
CREATE TABLE IF NOT EXISTS ml_contracts (
 id uuid PRIMARY KEY,
 project_id uuid NOT NULL REFERENCES ml_projects(id) ON DELETE CASCADE,
 version integer NOT NULL,
 status text NOT NULL DEFAULT 'Awaiting Signature' CHECK(status IN ('Awaiting Signature','Returned','Accepted','Corrections Requested','Superseded')),
 created_at timestamptz NOT NULL DEFAULT now(),
 reviewed_at timestamptz,
 UNIQUE(project_id,version)
);
CREATE TABLE IF NOT EXISTS ml_contract_files (
 id uuid PRIMARY KEY,
 project_id uuid NOT NULL REFERENCES ml_projects(id) ON DELETE CASCADE,
 contract_id uuid NOT NULL REFERENCES ml_contracts(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('original','signed')),
 filename text NOT NULL,
 mime_type text NOT NULL,
 content bytea NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ml_contracts_project ON ml_contracts(project_id,version);
CREATE INDEX IF NOT EXISTS ml_contract_files_contract ON ml_contract_files(contract_id);
ALTER TABLE ml_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_contract_files ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ml_contracts, ml_contract_files FROM PUBLIC;
DO $security$
DECLARE role_name text;
BEGIN
 FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname=role_name) THEN
   EXECUTE format('REVOKE ALL ON TABLE ml_contracts, ml_contract_files FROM %I',role_name);
  END IF;
 END LOOP;
END
$security$;
