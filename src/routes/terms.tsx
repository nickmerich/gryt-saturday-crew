import { createFileRoute, Link } from "@tanstack/react-router";
import grytBearAsset from "@/assets/gryt-bear.png.asset.json";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions · gryt run club" },
      {
        name: "description",
        content: "Terms of participation for GRYT Run Club.",
      },
      { property: "og:title", content: "Terms & Conditions · gryt run club" },
      { property: "og:description", content: "Terms of participation for GRYT Run Club." },
      { property: "og:url", content: "https://grytrunclub.com/terms" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms & Conditions · gryt run club" },
      { name: "twitter:description", content: "Terms of participation for GRYT Run Club." },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <nav className="sticky top-0 z-50 bg-ink border-b border-paper/15">
        <div className="flex items-center justify-between px-5 sm:px-8 md:px-12 h-[68px]">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={grytBearAsset.url}
              alt="gryt club bear"
              className="h-11 w-11"
              width={44}
              height={44}
              loading="lazy"
            />
            <span className="wordmark uppercase text-[20px] leading-none [text-shadow:2px_2px_0_var(--blue)]">
              Run Club
            </span>
          </Link>
          <Link
            to="/"
            className="bg-blue text-ink px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-paper transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-[720px] mx-auto px-6 sm:px-12 py-16 md:py-24">
        <div className="eyebrow eyebrow-blue mb-4">Terms & Conditions</div>
        <h1 className="display-condensed text-paper text-[clamp(32px,4vw,52px)] mb-8">
          Show up smart. Look out for each other.
        </h1>

        <div className="flex flex-col gap-8 text-[15px] leading-[1.7] text-paper/80">
          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Free community run club</h2>
            <p>
              GRYT Run Club is a free community run club. There are no membership fees, contracts, or obligations. You show up because you want to.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Voluntary participation</h2>
            <p>
              Participation is completely voluntary. You can join, skip, or stop attending at any time without notice or penalty.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Your health and safety</h2>
            <p>
              Runners are responsible for their own health, safety, hydration, and gear. Know your limits, dress for the weather, and bring water if you need it. We look out for each other, but every runner makes their own decisions.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Things change</h2>
            <p>
              Weather, routes, and meetup details may change. We post updates in the Strava group chat and send alerts when needed. Check before you head out if conditions look questionable.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Waiver</h2>
            <p>
              A signed waiver may be required for participation. Signing the waiver helps protect the club and confirms you understand the risks of running in a group setting. If you haven't signed one yet, you can do it here on the site before your first run.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Questions?</h2>
            <p>
              Reach out at{" "}
              <a
                href="mailto:hello@grytrunclub.com"
                className="text-blue underline hover:text-paper transition-colors"
              >
                hello@grytrunclub.com
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-12 text-xs text-paper/40">
          Last updated: June 2026
        </p>
      </main>
    </div>
  );
}
