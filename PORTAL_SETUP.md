# Maison Lucia client portal

This extends the existing Next.js / Vercel site. Keep the existing Vercel project and domain; do not create a replacement site.

## Activate

1. Connect a hosted PostgreSQL database to the existing `maison-lucia-site` Vercel project. Set the **server-only** `DATABASE_URL` connection string using the provider's TLS settings. A pooled connection URL is suitable for serverless deployments. The app does not disable certificate verification.
2. Set **server-only** `PORTAL_ADMIN_PASSWORD` to a unique random password of at least 16 characters. Share it only with the Maison Lucia manager. There is no default password in the repository.
3. Keep `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` from the existing inquiry form. New questionnaires are saved first and then emailed using this key. If email delivery fails, the saved inquiry remains in the management inbox; no data is discarded. The management inbox refreshes every 30 seconds while open. Email notifications currently cover new questionnaires, not every conversation message.
4. With `DATABASE_URL` set in the shell, run `npm run portal:setup` once to create the tables and indexes. The script is idempotent. The production database must support ordinary PostgreSQL transactions. Do not use local filesystem storage on Vercel.
5. Deploy the changes to the existing Vercel project. Test the routes and the workflow below before inviting real clients.

### Supabase

Create a separate Maison Lucia project in the organization selected by the owner. For Vercel runtime traffic use the project's **Connect → Transaction pooler** URL, including its actual pooler hostname and username, with TLS configured. Do not guess the pooler hostname from the project's region. The app uses parameterized queries without named prepared statements and uses a single checked-out connection for each transaction, so transaction pooling is supported.

The schema enables RLS on every portal table and revokes all privileges from `PUBLIC`, `anon`, and `authenticated` (where these roles exist). No browser Data API policies are granted. The server connects as the project's privileged PostgreSQL owner and enforces project authorization in its API. Do not send this connection string to browsers. Supabase Auth is not required for the requested designer-issued client-code flow.

Supabase connections automatically require TLS with certificate verification, even when the copied URL has no SSL query parameters. If the provider's connection requires its root certificate, set server-only `DATABASE_CA_CERT` to the PEM certificate from Supabase; never disable certificate verification.

Run the schema in the new project's SQL Editor or through the connected Supabase SQL tools, then verify the six tables, RLS status, denied browser-role privileges, and advisory results before deploying. Keep existing AskVic projects and tables unchanged. A new organization has its own billing plan; check the actual project creation cost before creating it.

`/event-questionnaire` shows a preparation notice and disables submission until both private settings are present. `/portal/manage` and the APIs refuse unavailable database or login configuration. Merely deploying the code does not create a production database.

## Manager workflow

- Open `/portal/manage`, sign in, and select an inquiry.
- Review its original questionnaire and inspiration images.
- Create a client code. Copy it while visible and share it privately alongside `https://maisonluciallc.com/portal`. Codes are not emailed automatically.
- Each code contains 128 bits of randomness and is stored only as a SHA-256 hash. The plaintext is shown only on creation. Replacing a code revokes the old code and existing client sessions.
- Add design concepts with descriptions and up to three images each. Add a revised concept as a new idea to preserve the earlier conversation.
- Reply under individual designs or in the general Conversation tab.
- Compose an itemized USD proposal with quantities, prices, additional charges, and your own scope, tax, setup, delivery, and payment terms. No rates or legal terms are assumed by the application. Use separate line items to itemize multiple fees.
- The client reviews and approves the current version with their full name and explicit confirmation. Approval records the name, time, accepted content, and version, then creates an invoice. Approval is a recorded client action; it is not an external e-signature service or evidence that payment occurred.
- The invoice preserves the accepted proposal content. Clients can print or save the displayed invoice as PDF. There is no checkout or online payment processing.
- Sharing a revised proposal replaces only pending proposals. Previously accepted versions and invoices remain intact. A later approved revision gets its own invoice and does not silently overwrite an earlier invoice.

## Data and access

- Questionnaires, compressed image data, designs, messages, proposal versions, and approval records live in PostgreSQL.
- Client sessions are restricted to the project bound to their code. The manager can access all inquiries. API authorization enforces this even if a client changes the supplied project ID.
- Cookies are HTTP-only, SameSite=Strict, Secure in production, and expire after 12 hours. Session tokens are hashed at rest. Rotating the management password prevents future use of the old password; to revoke current management sessions immediately, delete admin rows from `ml_sessions`.
- POST APIs require JSON and reject cross-origin requests. Login, inquiry, and message rate limits are stored in the database and remain effective across serverless instances. Login limits apply per client IP (Vercel trusted forwarding header in production).
- Image inputs are limited to JPEG, PNG, and WebP, resized in the browser, capped server-side, and stored with the event. SVG and HTML uploads are not accepted. This first version stores images in database records; use dedicated private object storage if high-volume usage requires it.
- Private pages request no indexing, and private API responses use `Cache-Control: no-store`.
- The owner is responsible for database backups and retention. No production credentials, real clients, or example client records are included.

## Verification

Run `npm test` for PostgreSQL-backed API integration checks using PGlite (test-only in-process PostgreSQL), and `npm run build` for the complete site build. Tests exercise access isolation, designs and replies, proposal revisions, exact invoice snapshots, idempotent approvals, and code/session revocation. PGlite does not substitute for verifying a hosted connection, production concurrency, or actual Web3Forms delivery.

Smoke-test on Vercel: submit a questionnaire; verify inbox and notification; issue a code; sign in separately as the client; share a design and exchange comments; send a proposal; request a revision; approve the replacement; view/save its invoice. Test a second client and confirm project isolation.
