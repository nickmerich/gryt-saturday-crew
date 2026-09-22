import { createServerFn } from '@tanstack/react-start';
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from '@/lib/stripe.server';
import { refuseRunEntryCheckout } from '@/lib/run-entry-policy';

type CheckoutSessionResult = { clientSecret: string } | { error: string };

export const createDonationCheckout = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    amountInCents: number;
    customerEmail?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!data.amountInCents || data.amountInCents < 100) {
      throw new Error('Amount must be at least $1');
    }
    if (data.amountInCents > 1_000_000) {
      throw new Error('Amount must be at most $10,000');
    }
    if (data.environment !== 'sandbox' && data.environment !== 'live') {
      throw new Error('Invalid environment');
    }
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'GRYT Donation' },
            unit_amount: data.amountInCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        ui_mode: 'embedded_page',
        return_url: data.returnUrl,
        payment_intent_data: { description: 'GRYT Donation' },
        ...(data.customerEmail && { customer_email: data.customerEmail }),
      });
      return { clientSecret: session.client_secret ?? '' };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createEventEntryCheckout = createServerFn({ method: 'POST' })
  // Refuse every payload, including renamed event IDs and stale client builds.
  // Keep this export so old callers cannot reopen paid run entry.
  .inputValidator((_data: unknown) => null)
  .handler(async (): Promise<CheckoutSessionResult> => refuseRunEntryCheckout());
