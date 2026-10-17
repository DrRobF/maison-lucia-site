-- Stripe payment integration: server access only, no browser Data API grants.
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

-- Existing sandbox records stay explicitly marked as test data.
ALTER TABLE ml_payment_plans ADD COLUMN IF NOT EXISTS livemode boolean NOT NULL DEFAULT false;
ALTER TABLE ml_payment_installments ADD COLUMN IF NOT EXISTS livemode boolean NOT NULL DEFAULT false;

-- Independent invoices do not require proposals, agreements, or payment plans.
CREATE TABLE IF NOT EXISTS ml_standalone_invoices (
 id uuid PRIMARY KEY,
 project_id uuid NOT NULL REFERENCES ml_projects(id),
 email_sent boolean NOT NULL DEFAULT false,
 description text NOT NULL CHECK(length(description) BETWEEN 1 AND 500),
 amount_cents integer NOT NULL CHECK(amount_cents BETWEEN 50 AND 99999999),
 due_date date NOT NULL,
 customer_id text,
 stripe_invoice_id text UNIQUE,
 stripe_status text NOT NULL DEFAULT 'not_created',
 hosted_url text,
 pdf_url text,
 amount_paid integer NOT NULL DEFAULT 0,
 amount_remaining integer NOT NULL DEFAULT 0,
 published boolean NOT NULL DEFAULT false,
 review_required boolean NOT NULL DEFAULT false,
 livemode boolean NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ml_standalone_invoices_project_idx ON ml_standalone_invoices(project_id);
ALTER TABLE ml_standalone_invoices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ml_standalone_invoices FROM PUBLIC;
DO $security$
DECLARE role_name text;
BEGIN
 FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname=role_name) THEN
   EXECUTE format('REVOKE ALL ON TABLE ml_standalone_invoices FROM %I',role_name);
  END IF;
 END LOOP;
END
$security$;

-- Private client-specific payment instructions, maintained by the owner.
ALTER TABLE ml_projects ADD COLUMN IF NOT EXISTS payment_options jsonb NOT NULL DEFAULT '{}'::jsonb;
