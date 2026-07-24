import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/checkout/return')({
  head: () => ({
    meta: [
      { title: 'Thank you — GRYT Run Club' },
      { name: 'description', content: 'Thanks for chipping in to GRYT Run Club.' },
      { property: 'og:title', content: 'Thank you — GRYT Run Club' },
      { property: 'og:description', content: 'Thanks for chipping in to GRYT Run Club.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === 'string' ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();

  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6 py-24">
      <div className="max-w-xl w-full border border-ink/15 bg-white p-10 md:p-14 shadow-[8px_8px_0_0_rgba(0,0,0,0.08)]">
        <div className="text-xs tracking-[0.2em] uppercase text-ink/60 mb-4">
          GRYT · Donation
        </div>
        {session_id ? (
          <>
            <h1 className="font-display text-4xl md:text-5xl uppercase leading-[0.95] mb-6">
              Thank you.<br />See you Saturday.
            </h1>
            <p className="text-ink/70 mb-8">
              Your donation keeps the coffee hot, the trail clear, and the
              Saturday crew showing up. We won't forget it.
            </p>
            <div className="text-[11px] tracking-widest uppercase text-ink/40 mb-8">
              Ref · {session_id.slice(-12)}
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl uppercase leading-[0.95] mb-6">
              No session found.
            </h1>
            <p className="text-ink/70 mb-8">
              We couldn't find a donation to confirm. If you were charged, email us.
            </p>
          </>
        )}
        <Link
          to="/"
          className="inline-block bg-ink text-paper px-6 py-3 text-sm tracking-[0.14em] uppercase hover:bg-baby-blue hover:text-ink transition"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
