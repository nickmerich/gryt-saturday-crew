# Stripe shop repair checks

## Release scope
- Repository: nickmerich/gryt-saturday-crew.
- Base and rollback: b21bafa3c818ee09acebec2275ab0126c720d0c1.
- Lovable project: ed7792b3-40ce-4ca7-a61e-885f853ac00b.
- Production domain: https://grytrunclub.com.
- Managed Lovable payment backend; preview uses sandbox, published build uses live.
- No database, Stripe account, inventory, price, RSVP, waiver or authentication changes.
- Production merge and publishing require approval for this repair.

## Shop to Stripe
- Start: /shop on desktop and mobile.
- Expect: a prominent link to /shop/checkout independent of Shopify availability.
- Click: Buy with Stripe.
- Expect: existing hat checkout, catalog price, quantity, delivery, name and email.
- Never complete a real charge during verification.

## Shopify retained
- Start: /shop.
- Expect: existing photo controls and cart drawer still work.
- Shopify unavailability must not claim all online checkout is unavailable.
- Existing Shopify add-to-cart, prices, stock and checkout are not modified.

## Payment controls retained
- Start: /support and /shop/checkout.
- Expect: hydration-gated fields, Continue, visible errors, no native GET submission.
- Start: /events/inactive-sample and /partners/pay without a token.
- Expect: unavailable event and private-link gates; no checkout buttons.

## Free Saturday flows retained
- Start: /shop.
- Click: RSVP This Saturday.
- Expect: /#join and the existing free RSVP/waiver flow.
- Do not submit test attendance or outbound messages.
