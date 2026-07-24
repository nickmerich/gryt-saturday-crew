
# Enable Stripe Payments

Set up Lovable's built-in Stripe integration (no API keys or Stripe account required to start) so GRYT can accept **donations** and **membership dues**. A test sandbox activates immediately; going live later requires claiming/verifying the Stripe account.

## Scope for this step

Just enable Stripe. Product creation, checkout UI, and webhook handling come in follow-up steps once the integration is live and the relevant knowledge files are surfaced.

## Steps

1. Call `enable_stripe_payments` to provision the seamless Stripe integration in test mode.
2. After it completes, set the default tax handling path:
   - **Donations**: no tax automation (donations aren't taxable).
   - **Membership dues**: tax calculation + collection only (`automatic_tax`, +0.5%) — dues to a US run club aren't clearly eligible for full compliance handling, and you handle any registration/filing.
3. Create the two products via `batch_create_product`:
   - **GRYT Support / Donation** — one-time, customer-chosen amount.
   - **GRYT Membership Dues** — recurring (monthly or yearly — you'll pick).
4. Implement checkout: a `createServerFn` that creates a Stripe Checkout Session and a client button on the homepage (donations) plus a dedicated membership section.
5. Add a webhook route at `src/routes/api/public/stripe-webhook.ts` to record successful payments and membership status.

## Technical notes

- Seamless Stripe is Lovable-managed — no `STRIPE_SECRET_KEY` to paste. Do not confuse with the legacy BYOK `enable_stripe` tool.
- Checkout session creation goes in a server function under `src/lib/` (e.g. `src/lib/stripe.functions.ts`), never in a loader.
- Webhook route lives under `/api/public/*` (bypasses auth) and must verify the Stripe signature before touching the DB.
- Persisting donations/members needs a new table (e.g. `payments`, `memberships`) with RLS + GRANTs — I'll draft the migration in the follow-up step.
- Success/cancel URLs will be same-origin routes on grytrunclub.com.

## Questions I'll ask before building checkout (not now)

- Membership cadence: monthly, yearly, or both?
- Suggested donation amounts (e.g. $5 / $15 / $50 / custom)?
- Where should the "Donate" and "Become a member" CTAs live on the site?

## What you'll need to do later

- Claim the Stripe account and complete verification to accept real payments.
- No action needed now — the sandbox works immediately after enable.

Approve this plan and I'll enable Stripe.
