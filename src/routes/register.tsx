import { createFileRoute, Link } from '@tanstack/react-router';
import { nextSaturdayLabelLong } from '@/lib/run-schedule';
import { siteUrl } from '@/lib/site';

/**
 * Paid run registration is retired — GRYT runs are free.
 *
 * This page is kept (rather than deleted) so already-shared links and any
 * existing purchaser landing here get an explanation instead of a 404. It is
 * noindex and removed from the sitemap; the only action is the free RSVP.
 */
export const Route = createFileRoute('/register')({
  head: () => ({
    meta: [
      { title: 'GRYT runs are free — no registration fee' },
      {
        name: 'description',
        content:
          'GRYT Run Club Saturday runs are free. There is no entry fee and no paid registration. RSVP on the homepage and show up at the trailhead.',
      },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'GRYT runs are free — no registration fee' },
      {
        property: 'og:description',
        content: 'No entry fee, no paid registration. RSVP free for Saturday 7 AM in McMurray, PA.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: siteUrl('/') }],
  }),
  component: RegisterRetiredPage,
});

function RegisterRetiredPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="px-6 sm:px-12 lg:px-24 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="text-[11px] tracking-[0.2em] uppercase text-ink/60 hover:text-ink underline underline-offset-4"
          >
            ← Back to home
          </Link>

          <div className="mt-6 text-xs tracking-[0.2em] uppercase text-ink/60">
            No entry fee
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl uppercase leading-[0.95]">
            GRYT runs are free.
          </h1>
          <p className="mt-5 text-lg text-ink/75">
            There is no registration fee, no paid entry, and nothing to buy to run with
            us. Tell us you're coming and show up at the trailhead.
          </p>

          <div className="mt-8 border-[1.5px] border-ink bg-white p-6">
            <div className="text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-1">
              Next run
            </div>
            <div className="font-display text-xl">
              {nextSaturdayLabelLong()}
            </div>
            <div className="mt-1 text-sm text-ink/70">
              212 Valley Brook Road, McMurray, PA · Montour / Peters Trail
            </div>
          </div>

          <Link to="/" hash="join" className="btn-primary mt-8 inline-block">
            RSVP free for Saturday →
          </Link>

          <p className="mt-8 text-sm text-ink/60">
            If you paid for a GRYT run entry at any point, email us and we'll sort it
            out. You were never supposed to be charged to run.
          </p>
        </div>
      </section>
    </main>
  );
}
