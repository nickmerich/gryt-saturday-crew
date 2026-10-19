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
      { property: "og:title", content: "Privacy Policy · gryt run club" },
      {
        property: "og:description",
        content: "How GRYT Run Club collects, uses, and protects your information.",
      },
      { property: "og:url", content: "https://grytrunclub.com/privacy" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy · gryt run club" },
      { name: "twitter:description", content: "How GRYT Run Club collects, uses, and protects your information." },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/privacy" }],
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
              When you RSVP or sign the waiver, we collect your name, email, phone, how you found GRYT, and RSVP details. That's it.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Why we collect it</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Run reminders</li>
              <li>Safety updates</li>
              <li>Community updates</li>
              <li>Event coordination</li>
            </ul>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">We do not sell your information</h2>
            <p>
              We do not sell, rent, or trade personal information. Only the organizers — Laura and Nick — have access. We do not share RSVP or waiver data with third parties, advertisers, or sponsors.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Unsubscribe or be removed</h2>
            <p>
              Every message includes an unsubscribe link. You can also email us anytime at{" "}
              <a
                href="mailto:nick@gryt.club"
                className="text-blue underline hover:text-paper transition-colors"
              >
                nick@gryt.club
              </a>{" "}
              and we'll remove you immediately.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Waiver records</h2>
            <p>
              Waiver signatures are stored securely and retained for the calendar year. They are used only for liability coverage and are not shared outside the club.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Questions?</h2>
            <p>
              Reach out at{" "}
              <a
                href="mailto:nick@gryt.club"
                className="text-blue underline hover:text-paper transition-colors"
              >
                nick@gryt.club
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
