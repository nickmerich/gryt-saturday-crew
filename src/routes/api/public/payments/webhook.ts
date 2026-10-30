import { createFileRoute } from '@tanstack/react-router';
import { type StripeEnv, verifyWebhook } from '@/lib/stripe.server';
import type Stripe from 'stripe';

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get('env');
        if (rawEnv !== 'sandbox' && rawEnv !== 'live') {
          console.error('Webhook received with invalid env:', rawEnv);
          return Response.json({ received: true, ignored: 'invalid env' });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          {
            const { recordTestPayment } = await import('@/lib/test-payment-webhook.server');
            await recordTestPayment(event as Stripe.Event, env);
          }
          if (event.type === 'checkout.session.completed') {
            const session: any = event.data.object;
            console.log('[donation] completed', {
              id: session.id,
              amount_total: session.amount_total,
              currency: session.currency,
              env,
            });
          } else {
            console.log('[stripe] unhandled event:', event.type);
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error('Webhook error:', e);
          return new Response('Webhook error', { status: 400 });
        }
      },
    },
  },
});
