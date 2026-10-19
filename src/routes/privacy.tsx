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
        <h1 className="display-condensed text-paper text-[clamp(32px,4vw,52px)] mb-3">
          Your data. Your trust.
        </h1>
        <p className="text-xs text-paper/40 mb-8">Last updated: October 2026</p>

        <div className="flex flex-col gap-8 text-[15px] leading-[1.7] text-paper/80">
          <section>
            <p>
              GRYT Run Club (&#34;we,&#34; &#34;us,&#34; or &#34;our&#34;) operates as a free community running club based in New York City. This Privacy Policy explains what personal information we collect when you interact with our website or events, how we use it, and what choices you have. We keep things simple because we are a small club — not a corporation — and we believe you deserve to know exactly where your information goes.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">What we collect</h2>
            <p className="mb-2">
              When you RSVP for a run or sign the liability waiver, we collect:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mb-2">
              <li>Your name and email address</li>
              <li>Your phone number (for day-of safety communications)</li>
              <li>How you heard about GRYT Run Club</li>
              <li>Your RSVP details for specific events</li>
              <li>Your digital waiver signature and the date it was signed</li>
            </ul>
            <p>
              We do not collect payment information, government IDs, or sensitive personal data. We do not require you to create an account.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">How we use your data</h2>
            <p className="mb-2">We use the information you provide only to run the club:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Sending run reminders and schedule updates</li>
              <li>Communicating safety information before or during an event</li>
              <li>Coordinating event logistics (start location, cancellations, weather holds)</li>
              <li>Sending occasional community updates about new routes or special events</li>
              <li>Maintaining waiver records for liability coverage</li>
            </ul>
            <p className="mt-2">
              We do not use your information for advertising, profiling, or any automated decision-making.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Cookies and tracking</h2>
            <p>
              Our website uses minimal tracking. We may use basic analytics (such as Google Analytics) to understand how many people visit the site and which pages are most useful. This data is aggregated and anonymous — we cannot identify you from it. You can opt out of Google Analytics at any time by installing the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="text-blue underline hover:text-paper transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics Opt-out Browser Add-on
              </a>
              . We do not run retargeting ads or sell analytics data to any third party.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Third-party services</h2>
            <p className="mb-2">
              To operate the club, we use a small number of trusted third-party tools:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Email provider</strong> — to deliver run reminders and updates to your inbox</li>
              <li><strong>Form and RSVP tools</strong> — to collect your sign-up information securely</li>
              <li><strong>Google Analytics</strong> — for anonymous website traffic data</li>
            </ul>
            <p className="mt-2">
              Each of these services has its own privacy policy governing how they handle data. We do not give these providers permission to use your data for their own marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">We do not sell your information</h2>
            <p>
              We do not sell, rent, or trade personal information — ever. Only the club organizers, Laura and Nick, have access to RSVP and waiver data. We do not share it with sponsors, advertisers, or any other third parties outside the service providers listed above.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Data retention</h2>
            <p>
              RSVP and contact information is kept for as long as you are an active member of the community. Waiver signatures are retained for the full calendar year in which they were signed, as required for liability coverage, and then deleted. If you ask us to remove your data, we will do so within 30 days.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Your rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Correction</strong> — ask us to update inaccurate information</li>
              <li><strong>Deletion</strong> — ask us to delete your data entirely</li>
              <li><strong>Opt-out</strong> — unsubscribe from any communications at any time</li>
            </ul>
            <p className="mt-2">
              Every message we send includes an unsubscribe link. You can also email us directly and we will honor your request immediately.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Changes to this policy</h2>
            <p>
              If we make meaningful changes to this policy, we will update the &#34;Last updated&#34; date at the top of this page. We encourage you to check back occasionally. Continued participation in GRYT Run Club events after a change is posted means you accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Contact us</h2>
            <p>
              Questions, requests, or concerns about your data? Reach out at{" "}
              <a
                href="mailto:hello@grytrunclub.com"
                className="text-blue underline hover:text-paper transition-colors"
              >
                hello@grytrunclub.com
              </a>
              . We will respond within a few business days.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
