import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { StripeEventEntryCheckout } from '@/components/StripeEmbeddedCheckout';
import { PaymentTestModeBanner } from '@/components/PaymentTestModeBanner';

const EVENT = {
  id: 'gryt_saturday_long_run',
  name: 'GRYT Saturday Long Run',
  amountInCents: 2500,
  date: 'Saturday · 7:00 AM',
  location: 'Montour / Peters Trail · McMurray, PA',
  description:
    'Timed group run with bib, aid support, post-run coffee, and a finisher photo. Walk, jog, or race — everyone finishes.',
};

export const Route = createFileRoute('/register')({
  head: () => ({
    meta: [
      { title: 'Register — GRYT Saturday Long Run' },
      {
        name: 'description',
        content:
          'Reserve your spot for the GRYT Saturday Long Run. Secure Stripe checkout, timed bib, aid support, and coffee at the finish.',
      },
      { property: 'og:title', content: 'Register — GRYT Saturday Long Run' },
      {
        property: 'og:description',
        content:
          'Reserve your spot for the GRYT Saturday Long Run in McMurray, PA. Timed, supported, and social.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const total = EVENT.amountInCents * quantity;

  const startCheckout = () => {
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email so we can send your confirmation.');
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <>
      <PaymentTestModeBanner />
      <main className="min-h-screen bg-paper text-ink">
        <section className="px-6 sm:px-12 lg:px-24 py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/"
              className="text-[11px] tracking-[0.2em] uppercase text-ink/60 hover:text-ink underline underline-offset-4"
            >
              ← Back to home
            </Link>

            <div className="mt-6 text-xs tracking-[0.2em] uppercase text-ink/60">
              Event Registration
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-6xl uppercase leading-[0.95]">
              {EVENT.name}
            </h1>
            <p className="mt-4 text-ink/70 max-w-xl">{EVENT.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="border border-ink/15 bg-white p-4">
                <div className="text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-1">
                  When
                </div>
                <div className="font-display">{EVENT.date}</div>
              </div>
              <div className="border border-ink/15 bg-white p-4">
                <div className="text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-1">
                  Where
                </div>
                <div className="font-display">{EVENT.location}</div>
              </div>
            </div>

            {checkoutOpen ? (
              <div className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xs tracking-[0.2em] uppercase text-ink/60">
                    {quantity} × entry · ${(total / 100).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="text-xs tracking-[0.14em] uppercase text-ink/60 hover:text-ink underline underline-offset-4"
                  >
                    Change details
                  </button>
                </div>
                <div className="border border-ink/15 bg-white p-2 md:p-4 shadow-[8px_8px_0_0_rgba(0,0,0,0.08)]">
                  <StripeEventEntryCheckout
                    eventId={EVENT.id}
                    eventName={EVENT.name}
                    amountInCents={EVENT.amountInCents}
                    quantity={quantity}
                    customerEmail={email}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-10 border border-ink/15 bg-white p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.08)]">
                <div className="flex items-baseline justify-between mb-6">
                  <div className="text-[11px] tracking-[0.2em] uppercase text-ink/60">
                    Entry Fee
                  </div>
                  <div className="font-display text-3xl">
                    ${(EVENT.amountInCents / 100).toFixed(0)}
                    <span className="text-sm text-ink/50"> / entry</span>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-2">
                    Entries
                  </label>
                  <div className="flex items-center border border-ink/20">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-12 w-12 border-r border-ink/20 hover:bg-ink hover:text-paper transition"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center font-display text-lg">{quantity}</div>
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="h-12 w-12 border-l border-ink/20 hover:bg-ink hover:text-paper transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-2">
                    Email (for confirmation)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="you@example.com"
                    className="w-full h-12 border border-ink/20 focus:border-ink outline-none px-3 bg-transparent"
                  />
                </div>

                <div className="flex items-baseline justify-between border-t border-ink/15 pt-4 mb-5">
                  <div className="text-[11px] tracking-[0.2em] uppercase text-ink/60">
                    Total
                  </div>
                  <div className="font-display text-2xl">
                    ${(total / 100).toFixed(2)}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 text-sm text-red-700" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={startCheckout}
                  className="w-full h-14 bg-baby-blue text-ink text-sm tracking-[0.2em] uppercase font-display border border-ink hover:bg-ink hover:text-paper transition"
                >
                  Register & Pay
                </button>

                <p className="mt-4 text-[11px] tracking-wider uppercase text-ink/50 text-center">
                  Secure checkout · Powered by Stripe
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
