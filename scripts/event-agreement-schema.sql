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
