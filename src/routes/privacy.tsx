import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · GRYT Run Club" },
      {
        name: "description",
        content: "How GRYT Run Club, the free South Hills run club in McMurray, PA, collects, uses, stores, and protects RSVP, waiver, and check-in information.",
      },
      { property: "og:title", content: "Privacy Policy · gryt run club" },
      {
        property: "og:description",
        content: "How GRYT Run Club, the free South Hills run club in McMurray, PA, collects, uses, stores, and protects RSVP, waiver, and check-in information.",
      },
      { property: "og:url", content: "https://grytrunclub.com/privacy" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy · gryt run club" },
      { name: "twitter:description", content: "How GRYT Run Club, the free South Hills run club in McMurray, PA, collects, uses, stores, and protects RSVP, waiver, and check-in information." },
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
              src="/img/gryt-bear.webp"
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
        <h1 className="display-condensed text-paper text-[clamp(32px,4vw,52px)] mb-4">
          GRYT Run Club Privacy Policy
        </h1>
        <p className="text-paper/70 text-[16px] leading-[1.7] mb-8">
          Your data. Your trust. GRYT Run Club is a free community run club in Pittsburgh's South Hills that
          meets Saturdays at 7 AM in McMurray, PA. This page explains, in plain language, what information we
          collect through grytrunclub.com, why we collect it, who can see it, and how to have it removed.
        </p>

        <div className="flex flex-col gap-8 text-[15px] leading-[1.7] text-paper/80">
          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">What we collect</h2>
            <p>
              When you RSVP or sign the waiver, we collect your name, email, phone, how you found GRYT, and RSVP details.
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-3">
              <li>
                <strong className="text-paper">Waiver:</strong> your signature, the date you signed, and the emergency
                contact name and phone you provide.
              </li>
              <li>
                <strong className="text-paper">Run check-ins:</strong> which Saturdays you attended, used to count
                milestones (5, 10, 25, 50, and 100 Saturdays) and to publish aggregate weekly run reports. Names only
                appear publicly with your consent.
              </li>
              <li>
                <strong className="text-paper">Forms you choose to send:</strong> anything you type into a contact,
                recommendation, or partner form.
              </li>
              <li>
                <strong className="text-paper">Optional support payments:</strong> if you choose to support the club,
                payment is handled by Stripe. We never see or store your full card number.
              </li>
              <li>
                <strong className="text-paper">Basic site analytics:</strong> we use Google Analytics to understand
                which pages are useful, such as page views, device type, and approximate location. We don't use it to
                identify you personally.
              </li>
            </ul>
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
              We do not sell, rent, or trade personal information. Only the organizers, Laura and Nick, have access. We do not share RSVP or waiver data with advertisers, sponsors, or partners.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Services that help us run the site</h2>
            <p>
              Like most small websites, we rely on a few service providers to host the site, store records securely,
              send run reminders by email, and process optional payments. They handle data only to provide that
              service to us and are not allowed to use it for their own marketing. If you connect Strava or follow our
              Strava club, Strava's own privacy policy applies to what you share there.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Cookies and local storage</h2>
            <p>
              The site uses a small number of cookies and browser storage items to keep forms working, remember
              preferences, and measure page visits. You can clear or block cookies in your browser settings. The site
              will still work for reading guides and RSVPing.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Kids and minors</h2>
            <p>
              GRYT runs are open to families, but the website is meant for adults. A parent or guardian should RSVP
              and sign the waiver on behalf of anyone under 18.
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
              Waiver signatures are stored securely and retained for the calendar year. They are used only for liability coverage and are not shared outside the club, except if required by our insurer or by law.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Your choices</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Ask to see the information we hold about you.</li>
              <li>Ask us to correct it or delete it.</li>
              <li>Unsubscribe from reminders at any time.</li>
              <li>Withdraw consent to have your name shown in run reports or milestones.</li>
            </ul>
            <p className="mt-3">Email us and we'll take care of it, usually within a few days.</p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Changes to this policy</h2>
            <p>
              If we change how we handle information, we'll update this page and the date below. Big changes will be
              mentioned in a run reminder email.
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
          Last updated: October 2026
        </p>
      </main>
    </div>
  );
}
