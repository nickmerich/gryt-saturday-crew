import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import ogImage from "@/assets/og-playbooks.jpg";

const SITE = "https://gryt-saturday-crew.lovable.app";
const URL = `${SITE}/resources/playbooks`;
const TITLE = "Playbooks · gryt run club";
const DESCRIPTION =
  "Long-form playbooks from Nick on building a run club from zero, the Saturday system, and training for the comeback. Free to read.";

export const Route = createFileRoute("/resources_/playbooks")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:image", content: `${SITE}${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE}${ogImage}` },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PlaybooksPage,
});


type Playbook = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  description: string;
  body: string[];
  comingSoon?: boolean;
};

const PLAYBOOKS: Playbook[] = [
  {
    slug: "start-a-run-club",
    title: "How to Start a Run Club From Zero",
    category: "Community",
    readTime: "12 min read",
    description:
      "The full playbook Nick used to launch GRYT: picking a location, setting a time, finding the first 10 members, and keeping them coming back.",
    body: [
      "Pick one location. Pick one time. Never move either.",
      "Most new clubs die because the founder treats the schedule like a suggestion. The single biggest unlock for GRYT was deciding Saturday 8:00 AM at the same trailhead — rain, snow, holiday weekend, doesn't matter. People plan their week around what they trust will exist.",
      "Find your first ten in person. Not on Instagram. Not in a Slack. Text ten people who already run, tell them the time and place, and show up if even one of them does. Week one we had three runners. Week six we had twelve. Week twenty we stopped counting.",
      "Make the loop simple. New runners are scared of the unknown distance more than the distance itself. Pick a flat, well-marked 3–5 mile loop everyone can finish, then layer a longer optional add-on for the faster crew. No one should ever wonder if they're going to get lost or dropped.",
      "End at a place with coffee. The run is the excuse. The community happens in the 30 minutes after.",
    ],
  },
  {
    slug: "saturday-system",
    title: "Consistency Over Intensity: The Saturday System",
    category: "Training",
    readTime: "8 min read",
    description:
      "Why showing up every Saturday at the same time changes how you see yourself — and the data behind it.",
    body: [
      "The Saturday System is one rule: one long-ish run, every Saturday, no exceptions.",
      "It works because identity beats motivation. You don't have to want to run on Saturday — you just have to be the kind of person who runs on Saturday. After 8–10 weeks, the decision stops being a decision.",
      "Pace doesn't matter. Distance only matters loosely. The single metric that predicts a runner's 12-month progress in our club is Saturdays-attended-out-of-Saturdays-possible. Above 75% and almost everyone PRs. Below 50% and almost no one does.",
      "If you miss a Saturday, you don't 'make it up' on Sunday. You just show up the next Saturday. The streak is the system.",
    ],
  },
  {
    slug: "comeback-runner",
    title: "The Comeback Runner's Guide",
    category: "Running",
    readTime: "10 min read",
    description:
      "For former athletes returning to endurance sport: mindset resets, training principles, and what actually matters.",
    body: [
      "Your old PRs are not your baseline. They're a ceiling you'll rebuild toward, not a floor you've fallen below.",
      "Spend the first eight weeks running slower than feels respectable. The aerobic engine rebuilds faster than the connective tissue, and the runners who get hurt in month two are the ones chasing month-twelve paces.",
      "Strength train twice a week, non-negotiable. Most adult-onset running injuries are strength problems disguised as mileage problems.",
      "Find a crew. The single best predictor of whether a comeback sticks is whether someone notices when you don't show up.",
    ],
  },
  {
    slug: "community-home-services",
    title: "Building Community in Home Services",
    category: "Business",
    readTime: "Coming soon",
    description:
      "How the same principles that built GRYT apply to franchise growth and local brand trust.",
    body: [],
    comingSoon: true,
  },
];

function PlaybooksPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <section className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[900px] mx-auto">
          <Link
            to="/resources"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All resources
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">LONG-FORM FROM NICK</p>
          <h1 className="display-condensed uppercase text-[clamp(48px,9vw,128px)] leading-[0.9]">
            Playbooks
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl max-w-[640px] leading-[1.55]">
            Everything we've learned about building consistency, community, and
            a sustainable running life — written down, shared freely.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[900px] mx-auto flex flex-col gap-16 md:gap-20">
          {PLAYBOOKS.map((p) => (
            <article
              key={p.slug}
              id={p.slug}
              className={`border-t border-paper/15 pt-12 ${
                p.comingSoon ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-3 flex-wrap mb-5">
                <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] bg-blue text-ink">
                  {p.category}
                </span>
                <span className="eyebrow text-paper/55">{p.readTime}</span>
              </div>
              <h2 className="text-[28px] md:text-[40px] font-bold leading-[1.1] tracking-tight">
                {p.title}
              </h2>
              <p className="mt-5 text-paper/70 text-[16px] md:text-[17px] leading-[1.6]">
                {p.description}
              </p>
              {p.body.length > 0 && (
                <div className="mt-8 space-y-5">
                  {p.body.map((para, i) => (
                    <p
                      key={i}
                      className="text-paper/85 text-[16px] md:text-[17px] leading-[1.7]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}
              {p.comingSoon && (
                <p className="mt-6 eyebrow text-paper/40">Coming Soon</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <CTA />
      <SiteFooter />
    </main>
  );
}

function CTA() {
  return (
    <section className="bg-black px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15">
      <div className="max-w-[900px] mx-auto text-center">
        <p className="eyebrow text-blue mb-5">SATURDAY 8:00 AM</p>
        <h2 className="display-condensed uppercase text-[clamp(36px,6vw,80px)] leading-[0.92]">
          Stop reading. Start showing up.
        </h2>
        <p className="mt-6 text-paper/75 text-[16px] md:text-[17px] leading-[1.6] max-w-[560px] mx-auto">
          The playbooks only work if you run them. Come find us this Saturday.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link to="/" hash="first-time" className="btn-primary">
            Join This Saturday →
          </Link>
          <Link
            to="/resources"
            className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
          >
            Back to Resources
          </Link>
        </div>
      </div>
    </section>
  );
}
