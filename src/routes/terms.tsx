import { createFileRoute, Link } from "@tanstack/react-router";
import grytBearImg from "@/assets/img/gryt-bear.webp";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions · GRYT Run Club" },
      {
        name: "description",
        content: "Terms for joining GRYT Run Club's free Saturday 7 AM run in McMurray, PA and using this site: waiver, safety, conduct, photos, and content.",
      },
      { property: "og:title", content: "Terms & Conditions · GRYT Run Club" },
      { property: "og:description", content: "Terms for joining GRYT Run Club's free Saturday 7 AM run in McMurray, PA and using this site: waiver, safety, conduct, photos, and content." },
      { property: "og:url", content: "https://grytrunclub.com/terms" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms & Conditions · GRYT Run Club" },
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
              src={grytBearImg}
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
        <h1 className="display-condensed text-paper text-[clamp(32px,4vw,52px)] mb-4">
          GRYT Run Club Terms &amp; Conditions
        </h1>
        <p className="text-paper/70 text-[16px] leading-[1.7] mb-8">
          Show up smart. Look out for each other. These terms cover joining GRYT Run Club's free group runs,
          Saturdays at 7 AM on the Montour/Peters Trail in McMurray, PA, and using grytrunclub.com, including
          the runner guides, calculators, and run plan builder. By RSVPing, signing the waiver, or using the site,
          you agree to them.
        </p>

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
            <h2 className="display-condensed text-paper text-[22px] mb-2">Be a good crew member</h2>
            <p>
              GRYT is no-drop and open to every pace. Treat other runners, walkers, trail users, and neighbors with
              respect. Share the trail, keep right, and follow local trail rules. We may ask anyone who makes the group
              unsafe or unwelcoming to stop attending.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Kids, strollers, and dogs</h2>
            <p>
              Families are welcome. A parent or guardian is responsible for any minor they bring and signs the waiver
              for them. For current guidance on strollers and dogs, see the FAQ page.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Photos and video</h2>
            <p>
              We often take photos and short videos at runs and share them on our site and social channels. If you'd
              rather not appear, tell a founder at the run or email us and we'll keep you out of posts or take a post
              down.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Guides, plans, and tools</h2>
            <p>
              Our runner guides, pace calculator, what-to-wear tool, and run plan builder are general information,
              not medical or coaching advice. Talk to a doctor before starting a new training program, especially if
              you have a health condition or are returning from injury. Race dates and third-party details are checked
              when published but can change, so confirm with the organizer.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Our content</h2>
            <p>
              The GRYT name, crest, graphics, and written content belong to GRYT Run Club. You're welcome to share
              links and use the free downloadable graphics for personal, non-commercial posts about GRYT. Please ask
              before using our name or logo for anything commercial.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Optional support</h2>
            <p>
              Running with GRYT is always free. If you choose to support the club financially, that support is
              voluntary and does not buy entry, priority, or special treatment.
            </p>
          </section>

          <section>
            <h2 className="display-condensed text-paper text-[22px] mb-2">Changes to these terms</h2>
            <p>
              We may update these terms as the club grows. The date below shows the latest version. Your privacy is
              covered separately in our{" "}
              <Link to="/privacy" className="text-blue underline hover:text-paper transition-colors">
                privacy policy
              </Link>
              .
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
