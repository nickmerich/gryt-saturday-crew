import { describe, expect, mock, test } from 'bun:test';

// Exercise the actual exported validators/handlers with only transport and
// Stripe mocked. No network, credentials, checkout sessions, or emails.
type Handler = (ctx: { data: unknown }) => unknown;
mock.module('@tanstack/react-start', () => ({
  createServerFn: () => ({
    inputValidator: (validate: (data: unknown) => unknown) => ({
      handler: (handler: Handler) => (input: { data: unknown }) =>
        handler({ data: validate(input.data) }),
    }),
  }),
}));

const stripeCalls: unknown[] = [];
mock.module('../src/lib/stripe.server', () => ({
  createStripeClient: (environment: string) => {
    stripeCalls.push({ environment });
    return { checkout: { sessions: { create: async (payload: unknown) => {
      stripeCalls.push(payload);
      return { client_secret: 'synthetic-donation-secret' };
    } } } };
  },
  getStripeErrorMessage: () => 'synthetic provider failure',
}));
const { createEventEntryCheckout, createDonationCheckout } = await import('../src/lib/payments.functions');

describe('paid run entry is retired at the server boundary', () => {
  const cases = [
    ['legacy live checkout', { eventId: 'gryt_saturday_long_run', eventName: 'GRYT Saturday Long Run', amountInCents: 2500, quantity: 1, environment: 'live' }],
    ['renamed event', { eventId: 'renamed-run', eventName: 'Merch disguise', amountInCents: 2500, quantity: 1, environment: 'live' }],
    ['sandbox is not a back door', { eventId: 'gryt_saturday_long_run', environment: 'sandbox' }],
    ['zero-dollar checkout', { amountInCents: 0 }],
    ['malformed payload', 'not-an-object'],
    ['null payload', null],
    ['missing payload', undefined],
    ['forged return destination', { returnUrl: 'https://example.invalid', environment: 'live' }],
  ] as const;
  for (const [name, data] of cases) {
    test(name, async () => {
      const before = stripeCalls.length;
      const result = await createEventEntryCheckout({ data });
      expect(result).toEqual({
        error: 'GRYT runs are free. RSVP on the homepage; no payment is required.',
        code: 'RUNS_ARE_FREE',
        rsvpUrl: '/#join',
      });
      expect(result).not.toHaveProperty('clientSecret');
      expect(stripeCalls.length).toBe(before);
    });
  }
});

test('the separate donation handler still reaches the mocked provider', async () => {
  const before = stripeCalls.length;
  const result = await createDonationCheckout({ data: {
    amountInCents: 1500,
    environment: 'sandbox',
    returnUrl: 'http://localhost/checkout/return',
  } });
  expect(result).toEqual({ clientSecret: 'synthetic-donation-secret' });
  expect(stripeCalls.length).toBe(before + 2);
  expect(stripeCalls.at(-1)).toMatchObject({
    mode: 'payment',
    line_items: [{ quantity: 1, price_data: { unit_amount: 1500, product_data: { name: 'GRYT Donation' } } }],
  });
});
