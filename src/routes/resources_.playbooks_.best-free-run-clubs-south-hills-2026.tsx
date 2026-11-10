import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import southHills760Img from "@/assets/img/south-hills-run-clubs-760.webp";
import southHillsImg from "@/assets/img/south-hills-run-clubs.webp";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/playbooks/best-free-run-clubs-south-hills-2026`;
const TITLE =
  "Best Free Run Clubs in Pittsburgh's South Hills (2026) · gryt";
const DESCRIPTION =
  "Free run clubs in Pittsburgh's South Hills for 2026: GRYT in McMurray, City of Bridges, Fleet Feet and more. Cost, schedule, and drop policy compared.";
const PUBLISHED = "2026-09-01";
const MODIFIED = "2026-11-10";
const HERO = `${SITE}/img/south-hills-run-clubs-og.jpg`;

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "gryt", label: "GRYT Run Club: The South Hills Anchor" },
  { id: "others", label: "Other Options Worth Knowing" },
  { id: "compare", label: "Side-by-Side Comparison" },
  { id: "montour", label: "Running Groups on the Montour Trail" },
  { id: "beginners", label: "Which South Hills Clubs Work for Beginners" },
  { id: "motivation", label: "How to Stay Motivated With a Free Group" },
  { id: "first-run", label: "What to Expect at Your First GRYT Run" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Is there a free running club in Pittsburgh's South Hills?",
    a: "Yes. GRYT Run Club is a free, weekly running group based in McMurray, PA. It meets Saturday mornings at 7 AM at the Valley Brook Road trailhead on the Montour/Peters Trail. There's no membership fee and no pace requirement. First-timers RSVP on grytrunclub.com and sign a short waiver.",
  },
  {
    q: "What is a no-drop run club?",
    a: "A no-drop run club means no runner gets left behind. Regardless of pace, the group waits for everyone. Faster runners loop back or slow down, and the run ends when the last person finishes, not the first.",
  },
  {
    q: "Do I need to sign up before showing up to GRYT Run Club?",
    a: "There's no membership and no fee. First-timers RSVP on grytrunclub.com and sign a quick liability waiver before their first run, then meet the crew Saturday at 7 AM at 212 Valley Brook Road in McMurray.",
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
    a: "GRYT is based in the South Hills and runs every Saturday at 7 AM from the same trailhead in McMurray. Yinz Run Club runs every Wednesday at 6:30 PM from rotating businesses around the city, plus trail runs every other Saturday morning in rotating parks. Both are free and no-drop. GRYT is the better fit if you live in the South Hills and want one fixed weekly run close to home.",
  },
  {
    q: "How do you stay motivated running with a free community group in Pittsburgh?",
    a: "Pick one fixed weekly run close to home and treat it like an appointment, tell someone you'll be there, and count showing up rather than pace or distance. A no-drop group helps because a slow day never means running alone. At GRYT, the Saturday 7 AM time never changes, milestones are recognized at 5, 10, 25, 50, and 100 Saturdays, and walking counts.",
  },
  {
    q: "Is there a run club near Peters Township for casual runners?",
    a: "Yes. GRYT Run Club meets every Saturday at 7 AM at 212 Valley Brook Road in McMurray, which is in Peters Township. It's free, open to all paces, walkers are welcome, and it's no-drop, so nobody finishes alone. For a weeknight option nearby, City of Bridges Run Club hosts a Thursday 6:30 PM South Hills run at rotating spots, and Canonsburg Run Club meets Mondays at 6 PM in Canonsburg.",
  },
  {
    q: "Which running groups meet on the Montour Trail?",
    a: "GRYT Run Club meets on the Montour Trail every Saturday at 7 AM at 212 Valley Brook Road in McMurray, on the paved Peters Township section. As of November 10, 2026, it's the only weekly group run we could find on a public schedule that starts on the trail. The Greater Pittsburgh Road Runners Club held one 2026 event there, and the Montour Trail Council hosts races and walks.",
  },
  {
    q: "What are the best run clubs in the South Hills for beginners?",
    a: "Look for a no-drop rule, walkers welcome, and a route you can cut short. GRYT Run Club is no-drop on a flat, paved out-and-back every Saturday at 7 AM in McMurray. City of Bridges Run Club's Thursday 6:30 PM South Hills run has a dedicated run/walk leader with 3 and 5 mile options. Canonsburg Run Club starts with a one-mile loop on Mondays at 6 PM. All three are free.",
  },
  {
    q: "How does Sewickley Run Club compare to running groups in the South Hills?",
    a: "Sewickley Run Club (sewickleyrunners.org) is a free club that meets every Tuesday at 6:30 PM at the corner of Beaver Avenue and Broad Street in Sewickley. You choose a 5-mile loop through town or a shorter 5K out-and-back, all paces run together, and no one is left behind. The first Tuesday of each month is Test Run Tuesday, a no-pressure run for first-timers. Membership is free through a RunSignUp waiver, and there's no RSVP. Sewickley is a borough on the Ohio River about 15 miles northwest of Pittsburgh, on the opposite side of the city from the South Hills, so it's a long drive from McMurray. If you live north or northwest of the city, it's a great option. If you're in the South Hills, GRYT on Saturday mornings and City of Bridges' Thursday South Hills run are closer.",
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
    proximity: "Rotating city neighborhoods and parks",
    cost: "Free",
    schedule: "Wednesday 6:30 PM weekly; trail runs every other Saturday morning",
    drop: "No-drop, with pacers and sweepers",
  },
  {
    club: "City of Bridges Run Club",
    proximity: "Thursday South Hills run at rotating spots; Saturdays in the city",
    cost: "Runs free (register); optional $55/yr membership",
    schedule: "Weeknights 6:30 PM + Saturday 8 AM",
    drop: "Run/walk leader on Thursdays; pace groups on Saturdays",
  },
  {
    club: "Canonsburg Run Club",
    proximity: "Canonsburg, Washington County",
    cost: "Free",
    schedule: "Weekly, Monday 6 PM",
    drop: "Go at your own pace; one-mile loop with an optional two more",
  },
  {
    club: "Fleet Feet Pittsburgh",
    proximity: "South Hills store; weekly runs mostly in the East End",
    cost: "Free club; paid training programs optional",
    schedule: "Weeknights + Sunday 7:30 AM",
    drop: "Team leads by pace",
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
          "free run clubs South Hills, South Hills running club, McMurray run club, Peters Township running group, Montour Trail run club, Montour Trail running groups, South Hills run clubs for beginners, Pittsburgh no-drop run club, Yinz Run Club, City of Bridges Run Club, Canonsburg Run Club, Fleet Feet Pittsburgh run club, stay motivated running Pittsburgh",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: HERO },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:modified_time", content: MODIFIED },
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
          dateModified: MODIFIED,
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
            "City of Bridges Run Club",
            "Fleet Feet Pittsburgh",
            "Canonsburg Run Club",
            "Sewickley Run Club",
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
    <main className="bg-background text-foreground">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[760px] mx-auto">
          <Link
            to="/resources/playbooks"
            className="eyebrow text-foreground hover:text-foreground transition-colors"
          >
            ← All playbooks
          </Link>
          <p className="eyebrow text-foreground mt-8 mb-5">
            COMMUNITY · 8 MIN READ · BY NICK MERICH
          </p>
          <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,88px)] leading-[0.95]">
            Best Free Run Clubs in Pittsburgh's South Hills (2026 Guide)
          </h1>
          <p className="mt-7 text-foreground/75 text-lg md:text-xl leading-[1.55]">
            Which clubs exist, what they cost, and which one fits where you live
            and how you run.
          </p>

          <figure className="mt-10 border border-foreground/15">
            <img
              src={southHillsImg}
              srcSet={`${southHills760Img} 760w, ${southHillsImg} 1520w`}
              sizes="(max-width: 808px) 100vw, 760px"
              width={1520}
              height={1013}
              alt="Runners on a Pittsburgh trail at dawn with the city skyline and a mapped route overhead"
              className="w-full h-auto"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </figure>

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-foreground/15 p-5"
          >
            <p className="eyebrow text-foreground/70 mb-3">In this guide</p>
            <ul className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-foreground/80 hover:text-foreground/70 transition-colors text-[15px]"
                  >
                    → {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-5 text-foreground/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>
              If you've searched for free run clubs in Pittsburgh's South Hills
              and ended up on a Strava page or a generic city-wide list, you're
              not alone. The South Hills has real, weekly running groups worth
              knowing about, and one of them meets specifically in McMurray, on
              the Montour/Peters Trail, every Saturday morning at 7 AM.
            </p>
            <p className="text-foreground/70 text-[14px]">
              Updated November 10, 2026. Other clubs' schedules were last
              verified that day on each club's own site or local news
              coverage. They change, so confirm before you go.
            </p>
            <p>
              Here's what you actually want to know: which clubs exist, what
              they cost, and which one fits where you live and how you run.
            </p>

            <H2 id="gryt">GRYT Run Club: The South Hills Anchor</H2>
            <p>
              GRYT Run Club is a free running group based in the South Hills
              that meets at the same trailhead at the same time every week.
              Organized by Laura and Nick Merich, the club runs year-round,
              with no membership fee, no pace requirement, and a strict
              no-drop policy.
            </p>
            <p>
              Home base is 212 Valley Brook Road in McMurray, which sits in
              Peters Township (Washington County), right next to Upper St.
              Clair and Bethel Park. If you live anywhere in that corridor, the
              trailhead is a short drive, not a trip into the city.
            </p>
            <p className="border-l-2 border-blue pl-5">
              <strong className="text-foreground">Saturday mornings, 7 AM.</strong>{" "}
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
              Looking for a target? The Thanksgiving 5Ks are November 26,
              2026, and the 2027 Pittsburgh Marathon is May 2, 2027. The{" "}
              <Link to="/races" className="underline hover:text-foreground/70">
                GRYT races page
              </Link>{" "}
              keeps the verified dates. Saturday mornings on the Montour Trail
              are a good place to start building.
            </p>

            <H2 id="others">Other Options Worth Knowing</H2>
            <p>Here's the honest picture of what else is out there.</p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">
              Yinz Run Club
            </h3>
            <p>
              Yinz is one of Pittsburgh's most visible running groups. Its Run
              Crew meets every Wednesday at 6:30 PM at rotating businesses
              around the city, with 3 mile and 1 mile options, and its Trails
              group runs every other Saturday morning in rotating parks. Both
              are free and no-drop, with volunteer pacers and sweepers. If you
              want variety and a larger group and don't mind driving toward the
              city, Yinz is worth following.
            </p>
            <p>
              The tradeoff: the location changes from run to run, and the
              South Hills isn't their home base.
            </p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">
              City of Bridges Run Club
            </h3>
            <p>
              City of Bridges (CBRC) is an all-volunteer 501(c)(3) club and an
              RRCA member with certified coaches. Its group runs are free and
              open to everyone, and it asks runners to register for each one.
              An optional adult membership is $55 a year and adds a shirt,
              race discounts, and training plans. CBRC runs a Thursday 6:30 PM
              South Hills group run from rotating spots such as Mt. Lebanon,
              Castle Shannon, Brookline, and Carnegie, with 3 and 5 mile
              options and a dedicated run/walk leader. It also has a Saturday
              8 AM run that moves around the city with posted pace groups.
            </p>
            <p>
              The tradeoff: the South Hills run is a weeknight, and Saturdays
              usually mean driving into the city. If you want pace groups and a
              big multi-day schedule, CBRC is a great option. See our{" "}
              <Link
                to="/resources/playbooks/gryt-vs-city-of-bridges-run-club"
                className="underline hover:text-foreground/70"
              >
                GRYT vs City of Bridges comparison
              </Link>
              .
            </p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">
              Fleet Feet Pittsburgh
            </h3>
            <p>
              The running store's club is free to join. Fleet Feet has a South
              Hills store at 1751 N. Highland Road, but as of November 10,
              2026, its schedule doesn't list a weekly South Hills run. The
              weeknight runs start from Bakery Square and Schenley Oval in the
              East End, and the Sunday 7:30 AM long run rotates. Fleet Feet
              says an updated run club schedule is coming, so check its
              calendar. Read the full{" "}
              <Link
                to="/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs"
                className="underline hover:text-foreground/70"
              >
                GRYT vs Fleet Feet Pittsburgh comparison
              </Link>
              .
            </p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">
              Canonsburg Run Club
            </h3>
            <p>
              Canonsburg Run Club is a newer free group in Washington County.
              According to the{" "}
              <a
                href="https://www.observer-reporter.com/living/2026/oct/09/canonsburg-run-club-bringing-people-together-through-fitness/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground/70"
              >
                Observer-Reporter
              </a>
              , it meets every Monday at 6 PM in the parking lot across from
              The Spineasy Cycle Lounge for a one-mile loop, with the option to
              add two more miles. It's open to all ages and fitness levels,
              and everyone goes at their own pace.
            </p>
            <p>
              The tradeoff: it's a short weeknight loop. If Monday evening
              works better for you than Saturday morning, start there.
            </p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">
              Pittsburgh Rogue Runners &amp; Walkers
            </h3>
            <p>
              This one isn't free, but it belongs on the list if you want
              run/walk intervals. Rogue is an RRCA member club listed in Bethel
              Park that specializes in the run/walk method and has a walker
              division. It meets at rotating coffee shops and breweries around
              the Pittsburgh area and posts its schedule weekly. You can try
              one event, and after that the club asks you to become a member.
            </p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">Strava</h3>
            <p>
              It comes up constantly in search results, so it's worth addressing
              directly: Strava is a GPS tracking app and social platform. It is
              not a run club. You can follow local athletes, explore routes, and
              see what people are running in your area. All useful. But it
              doesn't put a real person at the trailhead waiting for you on a
              cold Saturday in October. A Strava account and a local run club
              serve different purposes. One complements the other.
            </p>

            <H2 id="compare">Side-by-Side Comparison</H2>
            <div className="overflow-x-auto border border-foreground/15">
              <table className="w-full text-left text-[14px] md:text-[15px] min-w-[640px]">
                <thead>
                  <tr className="border-b border-foreground/15 text-foreground">
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
                    <tr key={r.club} className="border-b border-foreground/10">
                      <td className="p-3 text-foreground font-bold">{r.club}</td>
                      <td className="p-3">{r.proximity}</td>
                      <td className="p-3">{r.cost}</td>
                      <td className="p-3">{r.schedule}</td>
                      <td className="p-3">{r.drop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <H2 id="montour">Running Groups on the Montour Trail</H2>
            <p>
              If you want a group that runs on the Montour Trail itself, GRYT
              is the weekly one: every Saturday at 7 AM from 212 Valley Brook
              Road in McMurray, on the flat, paved Peters Township section. As
              of November 10, 2026, it's the only weekly group run we could
              find on a public schedule that starts on the trail.
            </p>
            <p>
              The other clubs on this page start from rotating businesses or
              from the city. The Greater Pittsburgh Road Runners Club held one
              2026 event on the trail, and the Montour Trail Council hosts
              races and walks through the year. Our{" "}
              <Link
                to="/resources/articles/$slug"
                params={{ slug: "montour-trail-running-groups" }}
                className="underline hover:text-foreground/70"
              >
                guide to running groups on the Montour Trail
              </Link>{" "}
              lists them all, with days, costs, and sources.
            </p>

            <H2 id="beginners">Which South Hills Clubs Work for Beginners and Casual Runners</H2>
            <p>
              A beginner-friendly club comes down to a few things: no pace
              requirement, a no-drop rule so nobody finishes alone, walkers
              welcome, an out-and-back route so you can turn early, and
              something social after so you have a reason to come back. If you
              run for fun rather than for a time, those matter more than mileage.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">GRYT Run Club</strong> checks
                every box: Saturday 7 AM, 212 Valley Brook Road in McMurray
                (Peters Township), about 4 miles out and back on the flat,
                paved Montour/Peters Trail, free, no-drop, walkers welcome,
                RSVP and waiver at grytrunclub.com, coffee after.
              </li>
              <li>
                <strong className="text-foreground">City of Bridges Run Club</strong>{" "}
                has a dedicated run/walk leader on its Thursday 6:30 PM South
                Hills run, with 3 and 5 mile options at rotating spots. Runs
                are free with registration, and membership is an optional $55
                a year. Saturdays are 8 AM in the city, with posted pace
                groups.
              </li>
              <li>
                <strong className="text-foreground">Canonsburg Run Club</strong>{" "}
                is free and meets Mondays at 6 PM in Canonsburg. The route is
                a one-mile loop with an optional two more, and everyone goes
                at their own pace.
              </li>
              <li>
                <strong className="text-foreground">Fleet Feet Pittsburgh</strong>{" "}
                is free and store-backed. Its weeknight runs are in the East
                End. The Sunday 7:30 AM long run rotates locations and lists
                team leads down to walk/jog intervals, plus a walking
                division.
              </li>
              <li>
                <strong className="text-foreground">parkrun</strong> is a free,
                timed 5K every Saturday at 9 AM on the North Shore. Walkers are
                welcome, but it's a drive from the South Hills and you get a
                time on the clock, which some beginners love and some don't.
              </li>
            </ul>
            <p>
              Coming back after time off? Our guide on{" "}
              <Link
                to="/resources/articles/$slug"
                params={{ slug: "start-running-again-after-a-long-break" }}
                className="underline hover:text-foreground/70"
              >
                how to start running again after a long break
              </Link>{" "}
              has a six-week walk-run plan you can bring to any of these
              groups.
            </p>

            <H2 id="motivation">How to Stay Motivated Running With a Free Group in Pittsburgh</H2>
            <p>
              Free groups remove the money excuse, but they also remove the
              sunk cost that gets people out the door. Motivation has to come
              from somewhere else. Here's what works for the people who keep
              showing up on Saturdays.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">One fixed time, close to home.</strong>{" "}
                A run you have to plan around every week is a run you'll skip.
                GRYT is always Saturday at 7 AM, always at Valley Brook Road, so
                there's no weekly decision to make.
              </li>
              <li>
                <strong className="text-foreground">Count showing up, not pace.</strong>{" "}
                Pick a streak goal (four Saturdays in a row) instead of a speed
                goal. The{" "}
                <Link to="/milestones" className="underline hover:text-foreground/70">
                  GRYT Milestone Club
                </Link>{" "}
                recognizes 5, 10, 25, 50, and 100 Saturdays, and walking counts.
              </li>
              <li>
                <strong className="text-foreground">Run no-drop.</strong> The fastest
                way to quit a group is getting left behind on a bad day. In a
                no-drop group, someone loops back. You never finish alone.
              </li>
              <li>
                <strong className="text-foreground">Tell one person you're coming.</strong>{" "}
                RSVP, text a friend, or post in the Strava club. A name
                expecting you at 7 AM beats any alarm.
              </li>
              <li>
                <strong className="text-foreground">Stay for coffee.</strong> The
                conversation after the run is the part people come back for.
                Friends are better accountability than a training plan.
              </li>
              <li>
                <strong className="text-foreground">Put a race on the calendar.</strong>{" "}
                A Thanksgiving 5K or a spring half gives the Saturdays a point.
                Our{" "}
                <Link to="/plan" className="underline hover:text-foreground/70">
                  free run plan builder
                </Link>{" "}
                fits the rest of your week around the group run.
              </li>
            </ul>

            <H2 id="first-run">What to Expect at Your First GRYT Run</H2>
            <p>
              No membership and no fee. RSVP on the home page and sign the
              short waiver, then show up at 212 Valley Brook Road at 7 AM on a
              Saturday and you'll find the crew.
            </p>
            <p>
              Bring water if it's warm. Wear layers if it's cold. The
              Montour/Peters Trail is a paved rail trail, so road shoes are
              fine.
            </p>
            <p>
              The group will not leave you. That's the whole point of no-drop.
              If you're slower on a given day, someone will run back to meet
              you. If you haven't run in six months, that's fine. The trail
              doesn't know that, and neither does the crew.
            </p>

            <H2 id="faqs">FAQs</H2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="text-foreground font-bold text-[17px] md:text-[18px] mb-1.5">
                    {f.q}
                  </h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>

            <p className="text-foreground text-lg md:text-xl font-bold mt-12">
              If you've been waiting for a reason to start showing up, this
              Saturday is a good one.
            </p>
            <p className="text-foreground/70">
              Show up Saturday. 7 AM. Valley Brook Road trailhead.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              RSVP This Saturday →
            </Link>
            <Link
              to="/resources/playbooks"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-foreground/40 text-foreground hover:border-blue hover:text-foreground/70 transition-colors"
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
