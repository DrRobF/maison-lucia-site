# Maison Lucia Stripe payments

The portal creates separate deposit and final-balance invoices from an approved client proposal. Staff prepare each draft, review it, and explicitly publish the Stripe-hosted payment link. Publishing does not email or automatically charge the client. Signed webhooks update portal payment records.

## Environments and credentials

Use encrypted server-side Vercel settings on the existing `maison-lucia-site` project. Never put these in GitHub, chat, or a `NEXT_PUBLIC_` variable.

| Variable | Purpose |
| --- | --- |
| `STRIPE_MODE` | `test` by default; explicitly set `live` to enable real payment operations. |
| `STRIPE_SECRET_KEY` | Existing sandbox restricted `rk_test_` key (or compatible `sk_test_` key). |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the existing sandbox destination. |
| `STRIPE_LIVE_SECRET_KEY` | Separate restricted `rk_live_` key (or compatible `sk_live_` key) for Maison Lucia's live account. |
| `STRIPE_LIVE_WEBHOOK_SECRET` | Separate signing secret for the live destination. |

Keep sandbox credentials in place when adding live credentials. The webhook validates each event with that mode's signing secret; the portal only permits staff operations in the selected `STRIPE_MODE`. Key prefixes must match their mode. A live key pasted into the sandbox variable cannot turn on live payments. Changing Vercel settings requires a redeployment.

Prefer restricted keys with Customers, Invoices and Invoice Items read/write permissions, plus related read permissions required for invoice retrieval. The application does not need payout, banking or account-management permissions. It does not need a publishable key because payment details are collected on Stripe's hosted invoice page.

For the live website use Vercel's **Production** scope. This chooses the website deployment; `STRIPE_MODE` and the matching key choose whether money is real. Keep Preview/Development in test mode, with separate webhook destinations if needed.

## Stripe destination

In the correct Stripe account and mode, create a Snapshot webhook destination for:

`https://www.maisonluciallc.com/api/stripe/webhook`

Subscribe to `invoice.created`, `invoice.updated`, `invoice.finalized`, `invoice.finalization_failed`, `invoice.paid`, `invoice.payment_failed`, `invoice.voided`, `invoice.marked_uncollectible`, `invoice_payment.paid`, `credit_note.created`, `credit_note.updated`, `credit_note.voided`, and `charge.refunded`. Snapshot event version `2026-09-30.endive` was verified in the sandbox. The handler retrieves the latest invoice using the integration's pinned API version instead of applying a stale event snapshot.

Copy the **destination's** signing secret (`whsec_`) to its corresponding Vercel variable, not an API key. Sandbox and live destinations have different signing secrets even when their endpoint URL is identical. If Stripe shows a 400 signature error, recopy the correct destination secret, redeploy, and resend `invoice.paid`; do not charge again.

## Existing records and database setup

Run `scripts/payments-schema.sql` against the existing Maison Lucia database. `npm run portal:setup` runs both schemas for a new setup. The payment tables use RLS with public/anon/authenticated access revoked. All writes and reads go through authorized portal server routes.

The additive `livemode` columns default existing records to `false`. New schedules and installments are stamped with the selected mode. A sandbox schedule cannot be converted into a live schedule or operated on using live credentials. Synthetic test events/proposals cannot create real payment schedules. When the portal is live, sandbox schedules remain visible as read-only history, with payable links disabled. A project keeps one immutable schedule after its first Stripe draft; amendments require deliberate invoice review and a follow-up portal update.

## Live launch sequence

1. Complete Maison Lucia's business/owner verification and payout bank setup directly in Stripe. Confirm live payment and payout eligibility and resolve outstanding requirements.
2. Review invoice branding, Cards as an enabled Invoicing payment method, contact details, statement descriptor, and cancellation/refund terms.
3. Resolve applicable tax treatment before issuing real invoices (see below).
4. Add `STRIPE_LIVE_SECRET_KEY` and `STRIPE_LIVE_WEBHOOK_SECRET` to Vercel Production; leave the two sandbox settings intact.
5. Set `STRIPE_MODE=live` for Production and redeploy.
6. Open a real client event with an actually approved proposal. Set its deposit and balance, prepare a draft and verify amounts and dates. Publishing a live invoice requires an explicit review confirmation. A draft by itself does not charge the client.
7. Verify a signed live webhook is accepted. Actual live payment validation requires a legitimate authorized transaction; Stripe test cards must never be used in live mode. Do not automatically create a live test charge or refund merely to exercise the integration.

## Tax remains explicit and separate

Automatic tax is disabled, and the admin portal displays this. The API uses the already-approved proposal total without inventing a tax rate, registration or tax code. Before real invoicing, confirm the business's actual obligations and registrations, distinguish services/rentals/goods as appropriate, collect the correct billing/service locations, and confirm whether agreed prices include or exclude tax. Enabling Stripe Tax requires a separately reviewed integration of correct line-item classifications, registrations and price treatment. Adding a live API key does not configure tax.

## Verification

`npm test` covers test and simulated-live deposit/balance flows, credential prefix isolation, existing test records, synthetic fixture guards, exact totals, interrupted retries, repeated publishing, stale/duplicate events, client permissions, and raw webhook signatures with separate live/test secrets. `npm run build` checks Next.js compilation.

The sandbox's $25 deposit and $75 final balance were successfully paid, and the portal recorded both through Stripe notifications after the signing-secret mismatch was corrected. Mock live tests do not prove the live account is activated or credentials are installed. Live status and a legitimate first real payment must be verified separately.

## Standalone invoices
Owner → client → Invoices → Create invoice accepts a description, total and due date without any proposal, agreement, contract or client signature. Multiple standalone invoices can coexist with a proposal-linked deposit/balance plan. Save draft → Prepare Stripe invoice → Publish payment link; the separate Email invoice to client action sends the published invoice using Stripe only on explicit owner request. Retries reuse the same creation request and Stripe idempotency keys. Existing sandbox fixtures remain blocked from real invoicing.

Automatic tax remains disabled until sales-tax registrations, product/service categories and address handling are configured. An EIN alone does not establish state sales-tax registration. Do not mark an unregistered business registered in Stripe Tax.
