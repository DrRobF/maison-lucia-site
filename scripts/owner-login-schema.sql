
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
