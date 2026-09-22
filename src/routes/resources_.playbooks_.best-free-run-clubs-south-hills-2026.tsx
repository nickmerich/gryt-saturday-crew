import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import heroAsset from "@/assets/south-hills-run-clubs.png.asset.json";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/playbooks/best-free-run-clubs-south-hills-2026`;
const TITLE =
  "Best Free Run Clubs in Pittsburgh's South Hills (2026) · gryt";
const DESCRIPTION =
  "Free run clubs in Pittsburgh's South Hills for 2026, GRYT in McMurray, Yinz, City of Bridges, and why Strava isn't a run club. Cost, schedule, and drop policy compared.";
const PUBLISHED = "2026-09-01";
const HERO = `${SITE}${heroAsset.url}`;

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "gryt", label: "GRYT Run Club: The South Hills Anchor" },
  { id: "others", label: "Other Options Worth Knowing" },
  { id: "compare", label: "Side-by-Side Comparison" },
  { id: "first-run", label: "What to Expect at Your First GRYT Run" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Is there a free running club in Pittsburgh's South Hills?",
    a: "Yes. GRYT Run Club is a free, weekly running group based in McMurray, PA. It meets Saturday mornings at 7 AM at the Valley Brook Road trailhead on the Montour/Peters Trail. No membership fee, no pace requirement, no registration required.",
  },
  {
    q: "What is a no-drop run club?",
    a: "A no-drop run club means no runner gets left behind. Regardless of pace, the group waits for everyone. Faster runners loop back or slow down, and the run ends when the last person finishes, not the first.",
  },
  {
    q: "Do I need to sign up before showing up to GRYT Run Club?",
    a: "No. Just show up. Saturday at 7 AM at the Valley Brook Road trailhead in McMurray. No registration, no membership, no fee.",
  },
  {
    q: "What should I bring to my first group run?",
    a: "Water, weather-appropriate clothing, and a charged phone. Road shoes work fine on the paved Montour/Peters Trail. Everything else is optional.",
  },
  {
    q: "Is GRYT Run Club good for beginners?",
    a: "Yes. There's no pace requirement and no minimum distance. The no-drop policy means you won't be left behind. Runners coming back after a long break, first-time 5K trainees, and experienced marathoners all run together.",
  },
  {
    q: "What's the difference between GRYT Run Club and Yinz Run Club?",
    a: "GRYT is South Hills-based, runs weekly on a fixed Saturday schedule, and operates as a free drop-in group. Yinz Run Club is larger, city-adjacent, and runs biweekly. Both are free. GRYT is the better fit if you live in the South Hills and want a consistent weekly group close to home.",
  },
  {
    q: "Is Strava a run club?",
    a: "No. Strava is a GPS tracking app and social platform. It's useful for logging miles and following local athletes, but it doesn't organize group runs or put people on a trail at a fixed time. A local run club and a Strava account serve different purposes.",
  },
];

const COMPARISON: Array<{
  club: string;
  proximity: string;
  cost: string;
  schedule: string;
  drop: string;
}> = [
  {
    club: "GRYT Run Club",
    proximity: "McMurray / Peters Township (home base)",
    cost: "Free",
    schedule: "Weekly, Saturday 7 AM",
    drop: "No-drop",
  },
  {
    club: "Yinz Run Club",
    proximity: "City-adjacent, occasional South Hills",
    cost: "Free",
    schedule: "Biweekly",
    drop: "Varies by run",
  },
  {
    club: "City of Bridges Running Club",
    proximity: "South Hills group run in rotation",
    cost: "Paid membership",
    schedule: "Structured / coached",
    drop: "Coached pacing",
  },
  {
    club: "Strava",
    proximity: "App-based, no fixed location",
    cost: "Free app",
    schedule: "No scheduled group runs",
    drop: "N/A",
  },
];

export const Route = createFileRoute(
  "/resources_/playbooks_/best-free-run-clubs-south-hills-2026",
)({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "free run clubs South Hills, South Hills running club, McMurray run club, Peters Township running group, Montour Trail run club, Pittsburgh no-drop run club, Yinz Run Club, City of Bridges Running Club",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: HERO },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Community" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: HERO },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Best Free Run Clubs in Pittsburgh's South Hills (2026 Guide)",
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          author: { "@type": "Person", name: "Nick Merich" },
          publisher: {
            "@type": "Organization",
            name: "gryt run club",
            url: SITE,
          },
          mainEntityOfPage: URL,
          image: HERO,
          about: [
            "GRYT Run Club",
            "Yinz Run Club",
            "City of Bridges Running Club",
            "Strava",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Resources",
              item: `${SITE}/resources`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Playbooks",
              item: `${SITE}/resources/playbooks`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Best Free Run Clubs in Pittsburgh's South Hills (2026)",
              item: URL,
            },
          ],
        }),
      },
    ],
  }),
  component: SouthHillsPage,
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function SouthHillsPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[760px] mx-auto">
          <Link
            to="/resources/playbooks"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All playbooks
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">
            COMMUNITY · 8 MIN READ · BY NICK MERICH
          </p>
          <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,88px)] leading-[0.95]">
            Best Free Run Clubs in Pittsburgh's South Hills (2026 Guide)
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            Which clubs exist, what they cost, and which one fits where you live
            and how you run.
          </p>

          <figure className="mt-10 border border-paper/15">
            <img
              src={heroAsset.url}
              alt="Runners on a Pittsburgh trail at dawn with the city skyline and a mapped route overhead"
              className="w-full h-auto"
              loading="eager"
            />
          </figure>

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-paper/15 p-5"
          >
            <p className="eyebrow text-paper/55 mb-3">In this guide</p>
            <ul className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-paper/80 hover:text-blue transition-colors text-[15px]"
                  >
                    → {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-5 text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>
              If you've searched for free run clubs in Pittsburgh's South Hills
              and ended up on a Strava page or a generic city-wide list, you're
              not alone. The South Hills has real, weekly running groups worth
              knowing about, and one of them meets specifically in McMurray, on
              the Montour/Peters Trail, every Saturday morning at 7 AM.
            </p>
            <p>
              Here's what you actually want to know: which clubs exist, what
              they cost, and which one fits where you live and how you run.
            </p>

            <H2 id="gryt">GRYT Run Club: The South Hills Anchor</H2>
            <p>
              GRYT Run Club is the only free, fixed-schedule running group based
              specifically in the South Hills. Organized by Laura and Nick
              Merich, the club runs year-round, no membership fee, no pace
              requirement, and a strict no-drop policy.
            </p>
            <p className="border-l-2 border-blue pl-5">
              <strong className="text-paper">Saturday mornings, 7 AM.</strong>{" "}
              Meet at the Valley Brook Road trailhead in McMurray for a run on
              the Montour/Peters Trail. Distance is flexible. The time is not.
              Show up at 7 AM and you'll find people.
            </p>
            <p>
              The crew is typically 9 to 15 people on any given week. Some are
              training for a fall race. Some are just getting back into a
              routine. Some have been showing up every Saturday for over a year.
              Nobody asks your pace. Nobody gets left behind. The fastest people
              in the group are usually the ones waiting at the turnaround.
            </p>
            <p>
              The Pittsburgh Great Race on September 26–27, 2026 is a natural
              target for anyone building miles through the fall. A lot of GRYT
              regulars are pointing toward it. Saturday mornings on the Montour
              Trail are a good place to start.
            </p>

            <H2 id="others">Other Options Worth Knowing</H2>
            <p>Here's the honest picture of what else is out there.</p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">
              Yinz Run Club
            </h3>
            <p>
              Yinz is Pittsburgh's most visible running group. They run trails,
              they're active on social, and they draw a crowd. Their runs tend
              to be city-adjacent rather than South Hills-based, and they run
              biweekly rather than weekly. If you want variety and a larger
              group and don't mind driving toward the city, Yinz is worth
              following. Free to join.
            </p>
            <p>
              The tradeoff: the schedule is less predictable if you want a fixed
              weekly ritual, and the South Hills isn't their home base.
            </p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">
              City of Bridges Running Club
            </h3>
            <p>
              City of Bridges is a paid membership club with coached runs and a
              citywide structure. They do have a South Hills group run in their
              rotation, but it operates as a coached, fee-based program, not a
              free drop-in group. If you want structured training with a coach,
              it's worth looking into. If you want free and flexible, it's not
              the right fit.
            </p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">Strava</h3>
            <p>
              It comes up constantly in search results, so it's worth addressing
              directly: Strava is a GPS tracking app and social platform. It is
              not a run club. You can follow local athletes, explore routes, and
              see what people are running in your area, all useful. But it
              doesn't put a real person at the trailhead waiting for you on a
              cold Saturday in October. A Strava account and a local run club
              serve different purposes. One complements the other.
            </p>

            <H2 id="compare">Side-by-Side Comparison</H2>
            <div className="overflow-x-auto border border-paper/15">
              <table className="w-full text-left text-[14px] md:text-[15px] min-w-[640px]">
                <thead>
                  <tr className="border-b border-paper/15 text-paper">
                    <th className="p-3 font-bold uppercase tracking-[0.1em] text-[11px]">
                      Club
                    </th>
                    <th className="p-3 font-bold uppercase tracking-[0.1em] text-[11px]">
                      South Hills proximity
                    </th>
                    <th className="p-3 font-bold uppercase tracking-[0.1em] text-[11px]">
                      Cost
                    </th>
                    <th className="p-3 font-bold uppercase tracking-[0.1em] text-[11px]">
                      Schedule
                    </th>
                    <th className="p-3 font-bold uppercase tracking-[0.1em] text-[11px]">
                      Drop policy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((r) => (
                    <tr key={r.club} className="border-b border-paper/10">
                      <td className="p-3 text-paper font-bold">{r.club}</td>
                      <td className="p-3">{r.proximity}</td>
                      <td className="p-3">{r.cost}</td>
                      <td className="p-3">{r.schedule}</td>
                      <td className="p-3">{r.drop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <H2 id="first-run">What to Expect at Your First GRYT Run</H2>
            <p>
              No registration. No email required. Show up at Valley Brook Road
              at 7 AM on a Saturday and you'll find the crew.
            </p>
            <p>
              Bring water if it's warm. Wear layers if it's cold. The
              Montour/Peters Trail is a paved rail trail, so road shoes are
              fine.
            </p>
            <p>
              The group will not leave you. That's the whole point of no-drop.
              If you're slower on a given day, someone will run back to meet
              you. If you haven't run in six months, that's fine, the trail
              doesn't know that, and neither does the crew.
            </p>

            <H2 id="faqs">FAQs</H2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="text-paper font-bold text-[17px] md:text-[18px] mb-1.5">
                    {f.q}
                  </h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>

            <p className="text-paper text-lg md:text-xl font-bold mt-12">
              If you've been waiting for a reason to start showing up, the
              Pittsburgh Great Race is a good one.
            </p>
            <p className="text-paper/70">
              Show up Saturday. 7 AM. Valley Brook Road trailhead.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="first-time" className="btn-primary">
              RSVP for Saturday →
            </Link>
            <Link
              to="/resources/playbooks"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
            >
              Back to Playbooks
            </Link>
          </div>
        </div>
        <ShareButtons url={URL} title={TITLE} />
      </article>
      <SiteFooter />
    </main>
  );
}
