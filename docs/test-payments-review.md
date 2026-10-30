# GRYT separate test payments

Preview only. All new checkout handlers use the existing managed Stripe sandbox and reject live checkout. No manual Stripe secret is needed. Saturday RSVP, waiver and Shopify code are unchanged.

## Pages
- `/support`: $10/$25/$50 presets, $5 to $1,000 custom support, optional monthly subscription.
- `/shop/checkout`: separate $30 hat test checkout, free US shipping or free Saturday pickup. No Shopify inventory synchronization; do not enable live sales without resolving that boundary.
- `/events/sample-ticket-event`: inactive, so no ticket sales are exposed. Existing admin can create a separate real ticket event in `/admin/payments`.
- `/partners/pay`: requires a high-entropy private package link created in `/admin/payments`. Card plus ACH above $1,000. Stored links are hashed; copy each generated link when created.
- `/thank-you`: checks Stripe's actual session status and distinguishes pending bank payments.
- `/admin/payments`: existing verified organizer access only; products, events, private links, payment records and stopping future monthly support charges.

Lovable requires on-page Stripe Embedded Checkout rather than hosted redirect checkout. Server-side work uses this site's existing server functions and webhook route, not new legacy edge functions.

## Credentials and webhook
No new secrets are requested. Existing `STRIPE_SANDBOX_API_KEY`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET`, `LOVABLE_API_KEY` and test `VITE_PAYMENTS_CLIENT_TOKEN` are used securely.

Already-registered test webhook:
`https://project--ed7792b3-40ce-4ca7-a61e-885f853ac00b-dev.lovable.app/api/public/payments/webhook?env=sandbox`

Do not add another endpoint. The test endpoint now subscribes to checkout completed/expired, delayed payment success/failure and invoice paid alongside existing events. Live webhook unchanged.

## Owner setup still required
1. Stripe test tax settings require the actual business head-office address before hat checkout opens. Taxes were not disabled to bypass this.
2. Stripe rejected the account-settings API update. Set the statement descriptor to `GRYT RUN CLUB` and confirm successful-payment receipt emails in Stripe's test settings. One-time checkout requests already include the receipt email; monthly invoices use the Stripe customer email. Email delivery remains unverified.
3. The current signed-in account does not match the existing admin allowlist. Use an existing authorized organizer account; no permissions were expanded.

## Test purchase checklist
Use card `4242 4242 4242 4242`, future expiry, any three-digit CVC and a US billing address. Decline card: `4000 0000 0000 0002`.
1. Support: submit `/support`, complete one-time checkout, verify `/thank-you` and a paid record; repeat with monthly toggle and verify subscription and future-charge cancellation in admin.
2. Hat: after setting the real test tax address, test pickup and US shipping separately. Verify $30 base price, zero delivery charge, any applicable tax, address collection only for shipping, and paid records.
3. Tickets: create a clearly labelled test event using an authorized organizer, test quantity and capacity concurrently, verify paid tickets hold capacity and cancellation/expiry releases reservations. Keep the original sample inactive.
4. Partner: create private test packages at $1,000 and $1,001. Verify card-only versus card/ACH, valid/invalid link handling and no duplicate paid package checkout. ACH remains pending until settlement; use Stripe's sandbox bank flow, not a real bank account.

## Verification performed
Pages checked at 375/390/1440px: no overflow or page errors. One-time and monthly support forms mounted Stripe test checkout; monthly cancellation released the reservation. Hat checkout correctly exposes Stripe's missing tax-address error. Logged-out and the current unauthorized signed-in account could not access private data. Sample event and tokenless partner page are unavailable. Seven payment-rule tests and thirteen Shopify regression tests passed. New payment-file lint passed. Latest preview build passed.

No successful card purchase, delayed ACH settlement, signed webhook receipt, signed-in authorized admin mutation or concurrent capacity test was completed. Do not treat these as verified. Browser automation attempts did not submit a payment. Unpaid test database rows were removed; abandoned Stripe test sessions expire automatically. No production publish, live checkout, real RSVP or Shopify mutation occurred.

Schema added in `drizzle/migrations/0010_separate_test_payment_catalog.sql` and `0011_test_payment_receipt_unique_session.sql`: service-only products/events/packages/orders/payments, approved public projection and atomic reservation function. Shared preview/production database received additive schema and test-only rows; existing tables untouched.