-- Stripe sandbox integration: server access only, no browser Data API grants.
CREATE TABLE IF NOT EXISTS ml_payment_plans (
 project_id uuid PRIMARY KEY REFERENCES ml_projects(id),
 proposal_id uuid NOT NULL REFERENCES ml_proposals(id),
 total_cents integer NOT NULL CHECK(total_cents>0),
 customer_id text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ml_payment_installments (
 id uuid PRIMARY KEY,
 project_id uuid NOT NULL REFERENCES ml_payment_plans(project_id),
 kind text NOT NULL CHECK(kind IN ('deposit','balance')),
 amount_cents integer NOT NULL CHECK(amount_cents>0),
 due_date date NOT NULL,
 stripe_invoice_id text UNIQUE,
 stripe_status text NOT NULL DEFAULT 'not_created',
 hosted_url text,
 pdf_url text,
 amount_paid integer NOT NULL DEFAULT 0,
 amount_remaining integer NOT NULL DEFAULT 0,
 published boolean NOT NULL DEFAULT false,
 review_required boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(project_id,kind)
);
CREATE TABLE IF NOT EXISTS ml_stripe_events (
 id text PRIMARY KEY,
 processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ml_payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_payment_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_stripe_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ml_payment_plans,ml_payment_installments,ml_stripe_events FROM PUBLIC;
DO $security$
DECLARE role_name text;
BEGIN
 FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname=role_name) THEN
   EXECUTE format('REVOKE ALL ON TABLE ml_payment_plans,ml_payment_installments,ml_stripe_events FROM %I',role_name);
  END IF;
 END LOOP;
END
$security$;
