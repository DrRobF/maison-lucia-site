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
