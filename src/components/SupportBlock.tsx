import { useState } from 'react';
import { StripeDonationCheckout } from '@/components/StripeEmbeddedCheckout';

const PRESETS = [5, 15, 50];

export function SupportBlock() {
  const [selected, setSelected] = useState<number | 'custom'>(15);
  const [custom, setCustom] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checkoutAmount, setCheckoutAmount] = useState<number | null>(null);

  const resolveAmount = (): number | null => {
    if (selected === 'custom') {
      const n = Number(custom);
      if (!Number.isFinite(n) || n < 1) return null;
      if (n > 10000) return null;
      return Math.round(n * 100);
    }
    return selected * 100;
  };

  const startCheckout = () => {
    setError(null);
    const cents = resolveAmount();
    if (cents === null) {
      setError('Enter an amount between $1 and $10,000.');
      return;
    }
    setCheckoutAmount(cents);
  };

  if (checkoutAmount !== null) {
    return (
      <section className="bg-paper text-ink px-6 sm:px-12 lg:px-24 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-xs tracking-[0.2em] uppercase text-ink/60">
              GRYT · Donation · ${(checkoutAmount / 100).toFixed(2)}
            </div>
            <button
              type="button"
              onClick={() => setCheckoutAmount(null)}
              className="text-xs tracking-[0.14em] uppercase text-ink/60 hover:text-ink underline underline-offset-4"
            >
              Change amount
            </button>
          </div>
          <div className="border border-ink/15 bg-white p-2 md:p-4 shadow-[8px_8px_0_0_rgba(0,0,0,0.08)]">
            <StripeDonationCheckout
              amountInCents={checkoutAmount}
              customerEmail={email || undefined}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper text-ink px-6 sm:px-12 lg:px-24 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-xs tracking-[0.2em] uppercase text-ink/60 mb-3">
          Support GRYT · Suggested donation
        </div>
        <h2 className="font-display text-4xl md:text-5xl uppercase leading-[0.95] mb-4">
          Keep Saturday free.<br />Chip in what feels right.
        </h2>
        <p className="text-ink/70 mb-8 max-w-lg">
          GRYT is free and always will be. Donations cover coffee, trail cleanup,
          first-timer gear, and the small stuff that keeps the crew showing up.
          One-time only. No membership, no strings.
        </p>

        <div className="border border-ink/15 bg-white p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-4 gap-2 md:gap-3 mb-5">
            {PRESETS.map((amt) => {
              const active = selected === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setSelected(amt); setError(null); }}
                  className={`h-14 text-lg font-display tracking-tight border transition ${
                    active
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-white text-ink border-ink/20 hover:border-ink'
                  }`}
                >
                  ${amt}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => { setSelected('custom'); setError(null); }}
              className={`h-14 text-xs tracking-[0.14em] uppercase border transition ${
                selected === 'custom'
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-white text-ink border-ink/20 hover:border-ink'
              }`}
            >
              Custom
            </button>
          </div>

          {selected === 'custom' && (
            <div className="mb-5">
              <label className="block text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-2">
                Amount (USD)
              </label>
              <div className="flex items-center border border-ink/20 focus-within:border-ink">
                <span className="px-3 text-ink/60">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={10000}
                  step="1"
                  value={custom}
                  onChange={(e) => { setCustom(e.target.value); setError(null); }}
                  placeholder="25"
                  className="w-full h-12 bg-transparent outline-none text-lg font-display"
                />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-2">
              Email (optional — for receipt)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 border border-ink/20 focus:border-ink outline-none px-3 bg-transparent"
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700" role="alert">{error}</div>
          )}

          <button
            type="button"
            onClick={startCheckout}
            className="w-full h-14 bg-baby-blue text-ink text-sm tracking-[0.2em] uppercase font-display border border-ink hover:bg-ink hover:text-paper transition"
          >
            Chip in
          </button>

          <p className="mt-4 text-[11px] tracking-wider uppercase text-ink/50 text-center">
            Secure checkout · Powered by Stripe · One-time only
          </p>
        </div>
      </div>
    </section>
  );
}
