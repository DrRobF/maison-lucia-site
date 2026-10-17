# Maison Lucia sandbox payments

The client portal now supports an admin-reviewed payment schedule from the latest approved proposal, a deposit and remaining-balance invoice, and Stripe-hosted card payment pages. This release is intentionally sandbox-only: `rk_live_` and `sk_live_` keys are rejected. No real charges can be enabled by changing an environment variable alone.

## Connect the sandbox

1. In the **Maison Lucia LLC sandbox**, create a restricted `rk_test_` API key. Grant the integration read/write access for Customers, Invoices, and Invoice Items, plus the read permissions required by those resources. Use the sandbox API request logs to resolve any related permission errors. Do not give it payout, bank-account, or account-management permissions.
2. Store it as the encrypted **server-side** Vercel environment variable `STRIPE_SECRET_KEY` in the existing `maison-lucia-site` project. Do not put it in GitHub, chat, or a `NEXT_PUBLIC_` setting.
3. In that same sandbox, add a webhook endpoint for `https://www.maisonluciallc.com/api/stripe/webhook`, with API version `2026-08-26.dahlia`. Subscribe to `invoice.created`, `invoice.updated`, `invoice.finalized`, `invoice.finalization_failed`, `invoice.paid`, `invoice.payment_failed`, `invoice.voided`, `invoice.marked_uncollectible`, `credit_note.created`, `credit_note.updated`, `credit_note.voided`, and `charge.refunded`.
4. Store the endpoint's signing secret as encrypted `STRIPE_WEBHOOK_SECRET`. Preview URLs need their own endpoint and signing secret if testing there. Redeploy after environment changes.
5. Run `scripts/payments-schema.sql` on the existing Maison Lucia PostgreSQL database. New installations use `npm run portal:setup`, which runs both portal and payment schemas. Tables have RLS enabled and public/anon/authenticated grants revoked; access stays inside the portal's authenticated server API.
6. Configure Maison Lucia invoice branding and enable Cards for Invoicing in the sandbox Dashboard. The API intentionally uses dynamic payment methods and never specifies a payment-method allowlist.

The ChatGPT Stripe connection does not automatically install API keys or webhook signing secrets into Vercel. Account activation and a payout bank account are not needed to build or test the sandbox flow.

## Use it

Open `/portal/manage`, choose a client, and open **Invoices** after the client approves a proposal. Set the deposit (fixed amount or percentage shortcut) and due dates, then save the schedule. It can be edited before the first Stripe draft is created. Each installment is at least $0.50 and at most $999,999.99. The deposit plus final balance equals the approved total.

Use **Prepare test invoice** to create a draft. Review the amount and date, then **Publish test payment link**. This finalizes only that invoice, makes its hosted payment link available in the authenticated client portal, and does not email or automatically charge the client. The client follows **Pay deposit by card (test)** or **Pay final balance by card (test)**. Paid invoices have a receipt/invoice link and PDF.

Prepared invoices lock the schedule: changing totals, due dates or approved scope afterward requires deliberate invoice review in Stripe and a follow-up portal change. This release does not automatically invoice later proposal revisions, collect an extra full project total, or add a card surcharge. Refunds/credit notes are managed in Stripe; related records are flagged for review and displayed as original payment amounts rather than falsely describing them as net retained funds.

## Test before real use

- Use a dedicated test client, not a real client's active event.
- Create a $5,000 approved proposal, $1,500 deposit, and $3,500 final balance. Confirm each invoice's amount and due date before publishing.
- Pay with Stripe's test card `4242 4242 4242 4242`, a future expiry, and any test CVC/postal code. Never use a real card in the sandbox.
- Test a decline and 3DS authentication using Stripe's documented test cards.
- Confirm successful payment updates the right portal installment through the signed webhook. A browser redirect alone never marks payment as paid. Verify failed payment remains open, and repeat refresh does not duplicate invoices.
- Retry a webhook event; confirm duplicate delivery is harmless. Confirm unsigned requests return 400 and live events are rejected.
- Verify a different client cannot access or publish another project's invoice. Unpublished draft links are not exposed in client responses.
- Test refunds and credit notes in Stripe, checking review flags in the portal. Invoice status remains the canonical Stripe invoice state.

Local verification: `npm test` includes a PostgreSQL-compatible workflow, permission checks, exact installment totals, interrupted request recovery, repeated publish, stale/duplicate webhook handling, and real SDK signature verification. `npm run build` verifies Next.js compilation. These do not replace an actual sandbox payment after secure credentials are installed.

## Tax and live launch remain pending

Automatic tax is explicitly **disabled**, and the admin portal says so. Before implementing/enabling it, confirm the business's actual obligations and registrations, classify services/rentals/goods separately where needed, collect the correct billing/service locations, configure Stripe Tax settings and matching test registrations, and agree whether approved prices include or exclude tax. Do not turn it on merely because Stripe Tax is selected in the account. Mixed event-planning services and rentals must not inherit an invented blanket tax rate or tax code.

For a live launch, complete Stripe business/owner verification and banking, confirm payment/payout eligibility, review tax and cancellation/refund terms, implement separately reviewed live/test environment separation and invoice mapping, configure a live webhook and restricted live key, and test the final production flow. **This test-only release does not activate live payments.**
