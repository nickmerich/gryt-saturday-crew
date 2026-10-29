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
        <h1 className="display-condensed text-paper text-[clamp(32px,4vw,52px)] mb-2">
          Show up smart. Look out for each other.
        </h1>
        <p className="text-xs text-paper/40 mb-8">Version 1.1 &mdash; Last updated: October 2026</p>

        <nav aria-label="Terms sections" className="mb-10 p-5 border border-paper/15 text-[14px]">
          <p className="text-xs uppercase tracking-widest text-paper/40 mb-3">Contents</p>
          <ol className="flex flex-col gap-1 list-decimal list-inside text-paper/70">
            <li><a href="#acceptance" className="text-blue hover:text-paper transition-colors">Acceptance of Terms</a></li>
            <li><a href="#community" className="text-blue hover:text-paper transition-colors">Free Community Run Club</a></li>
            <li><a href="#participation" className="text-blue hover:text-paper transition-colors">Voluntary Participation</a></li>
            <li><a href="#responsibilities" className="text-blue hover:text-paper transition-colors">Your Health, Safety &amp; Responsibilities</a></li>
            <li><a href="#ip" className="text-blue hover:text-paper transition-colors">Intellectual Property</a></li>
            <li><a href="#liability" className="text-blue hover:text-paper transition-colors">Waiver &amp; Limitation of Liability</a></li>
            <li><a href="#changes" className="text-blue hover:text-paper transition-colors">Changes to Terms</a></li>
            <li><a href="#governing" className="text-blue hover:text-paper transition-colors">Governing Law</a></li>
            <li><a href="#contact" className="text-blue hover:text-paper transition-colors">Contact</a></li>
          </ol>
        </nav>

        <div className="flex flex-col gap-8 text-[15px] leading-[1.7] text-paper/80">
          <section id="acceptance">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Acceptance of Terms</h2>
            <p>
              By attending or participating in any GRYT Run Club event, run, or activity, you agree to these terms and conditions. These terms apply each time you participate, whether in person or through our website. If you do not agree with any part of these terms, please do not participate in club activities.
            </p>
          </section>

          <section id="community">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Free community run club</h2>
            <p>
              GRYT Run Club is a free community run club. There are no membership fees, contracts, or obligations. You show up because you want to. We are a volunteer-organized group, not a registered sports organization or certified training program. Nothing on this website or in our communications constitutes professional medical, fitness, or legal advice.
            </p>
          </section>

          <section id="participation">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Voluntary participation</h2>
            <p>
              Participation is completely voluntary. You can join, skip, or stop attending at any time without notice or penalty. No registration is required for most runs, though some special events may ask you to RSVP in advance so we can plan accordingly.
            </p>
          </section>

          <section id="responsibilities">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Your health, safety &amp; responsibilities</h2>
            <p>
              Runners are responsible for their own health, safety, hydration, and gear. Know your limits, dress for the weather, and bring water if you need it. We look out for each other, but every runner makes their own decisions about their participation.
            </p>
            <p className="mt-3">By participating, you agree to:</p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1 text-paper/70">
              <li>Act respectfully toward all other participants, run leaders, and members of the public</li>
              <li>Follow posted traffic laws, crosswalk signals, and trail rules at all times</li>
              <li>Not participate if you are injured, ill, or otherwise unable to run safely</li>
              <li>Refrain from conduct that could endanger yourself or others during group runs</li>
            </ul>
            <p className="mt-3">
              Weather, routes, and meetup details may change. We post updates in the Strava group chat and send alerts when needed. Check before you head out if conditions look questionable.
            </p>
          </section>

          <section id="ip">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Intellectual property</h2>
            <p>
              All original content on this website — including text, graphics, logos, and route designs — is the property of GRYT Run Club. You may share our content for personal, non-commercial purposes with appropriate credit. You may not reproduce, redistribute, or use our content for commercial purposes without written permission.
            </p>
          </section>

          <section id="liability">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Waiver &amp; limitation of liability</h2>
            <p>
              A signed waiver may be required for participation. Signing the waiver helps protect the club and confirms you understand the risks of running in a group setting. If you haven't signed one yet, you can do it here on the site before your first run.
            </p>
            <p className="mt-3">
              GRYT Run Club, its organizers, and volunteers are not liable for any injury, loss, or damage arising from your participation in club activities. Running involves inherent physical risks, including but not limited to falls, collisions, traffic hazards, and weather-related conditions. You participate at your own risk and are solely responsible for your own well-being before, during, and after each run.
            </p>
          </section>

          <section id="changes">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Changes to terms</h2>
            <p>
              We may update these terms from time to time to reflect changes in how we operate or to clarify existing policies. When we do, we will update the version number and date at the top of this page. Continued participation in club events after an update is posted constitutes your acceptance of the revised terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section id="governing">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Governing law and dispute resolution</h2>
            <p>
              These terms are governed by applicable law. If you have a concern or dispute related to your participation in GRYT Run Club activities, please raise it directly with club organizers by email. We are committed to resolving concerns informally and in good faith before any formal process is pursued.
            </p>
          </section>

          <section id="contact">
            <h2 className="display-condensed text-paper text-[22px] mb-2">Contact</h2>
            <p>
              If you have questions about these terms or about club policies, reach out at{" "}
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
          Version 1.1 &mdash; Last updated: October 2026
        </p>
      </main>
    </div>
  );
}
