import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripe, getStripeEnvironment } from '@/lib/stripe';
import { createDonationCheckout } from '@/lib/payments.functions';

interface Props {
  amountInCents: number;
  customerEmail?: string;
  returnUrl?: string;
}

export function StripeDonationCheckout({ amountInCents, customerEmail, returnUrl }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const result = await createDonationCheckout({
      data: {
        amountInCents,
        customerEmail,
        returnUrl: returnUrl || `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ('error' in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error('Stripe did not return a client secret');
    return result.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
