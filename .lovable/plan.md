
# Enable Stripe Payments — Donations Only

Set up Lovable's built-in Stripe integration so GRYT can accept **one-time donations** with suggested amounts (no membership subscription). A test sandbox is live now; going live requires claiming/verifying the Stripe account later in the Payments tab.

## Scope

- One-time donations only. Suggested amounts: **$5 / $15 / $50 / custom**.
- No membership dues, no recurring billing, no subscription plumbing.
- CTA lives in a new **"Support GRYT"** block on the homepage (above the footer) — no separate `/support` route for now.

## Steps

1. Create a single Stripe product **"GRYT Donation"** (used only for dashboard labeling). Actual amounts are dynamic via Stripe's `price_data` — donors pick preset or custom.
2. Add shared server utility `src/lib/stripe.server.ts` (`createStripeClient`, `getStripeErrorMessage`, `verifyWebhook`) and client helper `src/lib/stripe.ts` (`getStripe`, `getStripeEnvironment`).
3. Add `createDonationCheckout` server function in `src/lib/payments.functions.ts` that builds an embedded Checkout Session with `price_data` (dynamic amount, min 50¢), no tax automation (donations aren't taxable), no subscription mode.
4. Add `PaymentTestModeBanner`, `StripeEmbeddedCheckout`, and `useStripeCheckout` components.
5. Add a `SupportBlock` on the homepage (`src/routes/index.tsx`) — GRYT-styled paper card with preset amount pills, custom input, and "Chip in" button that opens the embedded checkout inline.
6. Add return route `src/routes/checkout.return.tsx` with a thank-you state that matches the house style.
7. Add webhook route at `src/routes/api/public/payments/webhook.ts` — required path, verifies Stripe signature, logs `checkout.session.completed` events. No DB table needed since there's no membership state to persist; the Payments tab already tracks transactions.
8. Install pinned `stripe@22.0.2`, `@stripe/stripe-js@9.2.0`, `@stripe/react-stripe-js@6.2.0`.

## Technical notes

- Seamless Stripe is Lovable-managed — no API keys to paste.
- Dynamic amounts use `price_data` (no `create_price` needed, no `lookup_key` resolution).
- No `automatic_tax` and no `managed_payments` — donations to a run club aren't taxable.
- Webhook path `/api/public/payments/webhook` is required by Lovable; bypasses auth by design, secured by Stripe signature verification.
- No new DB table this pass — Stripe dashboard + Payments tab are the source of truth. If you later want member-facing donation history or leaderboards, we add a `donations` table then.
- Client cap: input rejects amounts under $1 and over $10,000 with a friendly message.

## What you'll need to do later

- Claim the Stripe account and finish verification in the Payments tab to accept real (not test) payments. Test cards work in preview immediately (`4242 4242 4242 4242`).

Approve and I'll build it.
