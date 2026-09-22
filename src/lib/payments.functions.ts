import { createServerFn } from '@tanstack/react-start';
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from '@/lib/stripe.server';

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

/**
 * RETIRED: GRYT runs are free. No run entry may be charged for.
 *
 * This endpoint stays mounted so any already-shared link fails closed with a
 * clear message instead of 404-ing, but it never creates a checkout session
 * for a GRYT run again. Merch and partner payments must use their own
 * dedicated function, not this one.
 */
const RETIRED_RUN_ENTRY_EVENT_IDS = new Set([
  'gryt_saturday_long_run',
  'gryt_saturday_run',
])

export const createEventEntryCheckout = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    eventId: string;
    eventName: string;
    amountInCents: number;
    quantity: number;
    customerEmail?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.eventId)) throw new Error('Invalid eventId');
    if (RETIRED_RUN_ENTRY_EVENT_IDS.has(data.eventId) || /gryt[_-]?(saturday|run)/i.test(data.eventId)) {
      throw new Error('GRYT runs are free. There is no entry fee to pay.');
    }
    if (!data.eventName || data.eventName.length > 120) throw new Error('Invalid event name');
    if (!data.amountInCents || data.amountInCents < 100) throw new Error('Amount must be at least $1');
    if (data.amountInCents > 1_000_000) throw new Error('Amount too large');
    if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 10) {
      throw new Error('Quantity must be between 1 and 10');
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
            product_data: { name: `Event Entry — ${data.eventName}` },
            unit_amount: data.amountInCents,
          },
          quantity: data.quantity,
        }],
        mode: 'payment',
        ui_mode: 'embedded_page',
        return_url: data.returnUrl,
        payment_intent_data: { description: `Event Entry — ${data.eventName}` },
        metadata: { eventId: data.eventId, eventName: data.eventName, type: 'event_entry' },
        ...(data.customerEmail && { customer_email: data.customerEmail }),
      });
      return { clientSecret: session.client_secret ?? '' };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

