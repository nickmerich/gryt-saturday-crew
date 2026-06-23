import { createFileRoute, Link } from "@tanstack/react-router";
import grytBearAsset from "@/assets/gryt-bear.png.asset.json";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · gryt run club" },
      {
        name: "description",
        content: "How GRYT Run Club collects, uses, and protects your information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <div className="eyebrow eyebrow-blue mb-4">Privacy Policy</div>
        <h1 className="display-condensed text-paper text-[clamp(32px,4vw,52px)] mb-8">
          Your data. Your trust.
        </h1>

        <div className="flex flex-col gap-8 text-[15px] leading-[1.7] text-paper/80">
          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">What we collect</h2>
            <p>
              When you RSVP or sign the waiver, we collect your name, contact info (email or phone),
              and how you found us. That's it. We don't use cookies for tracking and we don't sell
              your data.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">How we use it</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Send run reminders and GRYT updates</li>
              <li>Keep a headcount so we know who to expect</li>
              <li>Contact you in case of a last-minute change</li>
            </ul>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Who sees it</h2>
            <p>
              Only the organizers — Laura and Nick — have access. We do not share RSVP or waiver
              data with third parties, advertisers, or sponsors.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Unsubscribe</h2>
            <p>
              Every message includes an unsubscribe link. Or email us anytime at{" "}
              <a
                href="mailto:hello@grytrunclub.com"
                className="text-blue underline hover:text-paper transition-colors"
              >
                hello@grytrunclub.com
              </a>{" "}
              and we'll remove you immediately.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Waiver records</h2>
            <p>
              Waiver signatures are stored securely and retained for the calendar year. They are
              used only for liability coverage and are not shared outside the club.
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
