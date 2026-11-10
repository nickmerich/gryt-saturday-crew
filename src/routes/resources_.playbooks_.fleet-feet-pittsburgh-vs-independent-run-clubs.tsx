import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Link as LinkIcon, Check, Facebook, Linkedin } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import ogImage from "@/assets/og-playbooks.jpg";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs`;
const TITLE =
  "GRYT Run Club vs Fleet Feet Pittsburgh: Free Run Clubs Compared · gryt";
const DESCRIPTION =
  "GRYT Run Club vs Fleet Feet Pittsburgh: schedules, cost, locations, and who each free run club fits, plus how a store run club differs from an independent one.";
const PUBLISHED = "2026-02-03";
const MODIFIED = "2026-11-10";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "fleet-feet-offers", label: "What Fleet Feet Pittsburgh's Running Group Offers" },
  { id: "paid-side", label: "The Paid Side" },
  { id: "geographic-reality", label: "The Geographic Reality" },
  { id: "independent-offers", label: "What Independent Run Clubs Offer" },
  { id: "worth-joining", label: "What Makes an Independent Club Worth Joining" },
  { id: "gryt", label: "GRYT Run Club: The South Hills Independent" },
  { id: "saturday-7am", label: "Why Saturday at 7 AM Matters" },
  { id: "trail", label: "The Trail" },
  { id: "who-fleet-feet", label: "Who Should Choose Fleet Feet Pittsburgh" },
  { id: "who-gryt", label: "Who Should Choose GRYT" },
  { id: "comeback", label: "Coming Back After a Long Break" },
  { id: "comparison", label: "The Honest Comparison" },
  { id: "one-more", label: "One More Thing Worth Saying" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Is Fleet Feet Pittsburgh's running group free to join?",
    a: "Yes. Fleet Feet Pittsburgh's club runs are free with code FREECLUB. The store also sells coached training programs, which are separate from the free club runs. Its 2026 programs were listed from $75 for an eight-week Winter Warriors session to $200 for a 16-week full marathon program.",
  },
  {
    q: "Does Fleet Feet Pittsburgh have any runs in the South Hills?",
    a: "Not a weekly one right now. Fleet Feet Pittsburgh has a South Hills store at 1751 N. Highland Road, but as of November 10, 2026, its Run With Us page lists weekly runs from Bakery Square on Mondays and Thursdays, a Wednesday track club at Schenley Oval, and a Sunday 7:30 AM long run from rotating locations. The Sunday run is scheduled to start from the South Hills store on November 15, 2026. Fleet Feet says an updated run club schedule is coming, so check its calendar.",
  },
  {
    q: "What free independent run clubs operate in Pittsburgh's South Hills?",
    a: "GRYT Run Club meets every Saturday at 7 AM on the Montour/Peters Trail in McMurray, with no fees, no pace requirement, and no store affiliation. City of Bridges Run Club, a volunteer nonprofit, also runs a free Thursday evening South Hills group run at rotating spots such as Mt. Lebanon, Castle Shannon, and Carnegie, and Canonsburg Run Club is a free Monday evening group.",
  },
  {
    q: "What's the difference between a retail-backed run club and an independent run club?",
    a: "A retail-backed club like Fleet Feet's is organized and funded by a running store, often tied to product launches, sponsored training programs, and store events. An independent club like GRYT has no retail sponsor, no upsell, and no agenda beyond showing up and running together.",
  },
  {
    q: "Are there Saturday morning run clubs in Pittsburgh's South Hills?",
    a: "Yes. GRYT Run Club meets every Saturday at 7 AM on the Montour/Peters Trail in McMurray. Free, open to walkers, joggers, and runners, with post-run coffee in the parking lot.",
  },
  {
    q: "What should I expect at my first GRYT run?",
    a: "Arrive ten minutes early and a founder or regular will introduce you before the run starts. The route is about four miles, flat, out-and-back on the Montour/Peters Trail. You run your pace. Nobody gets dropped. Coffee after.",
  },
  {
    q: "Can I do both Fleet Feet Pittsburgh and GRYT Run Club?",
    a: "Absolutely. Fleet Feet's weeknight and Sunday schedule and GRYT's Saturday morning slot don't overlap. If you're in the South Hills and want more weekly mileage with community, running both makes sense.",
  },
  {
    q: "Fleet Feet Pittsburgh vs free local run clubs: which is better?",
    a: "Neither is better in the abstract. Fleet Feet Pittsburgh's club runs are free and well organized, with weeknight runs, a Sunday long run, and optional paid training programs. Independent clubs like GRYT Run Club have no store attached and are built around one fixed weekly time and place. Pick the one closest to you at a time you can protect every week.",
  },
  {
    q: "Which free Pittsburgh run club is best if I'm not fast?",
    a: "Look for a no-drop policy and a walk or run-walk option. GRYT Run Club is no-drop and welcomes walkers on its Saturday 7 AM run in McMurray. Fleet Feet's Sunday long run lists team leads down to walk/jog intervals and a walking division.",
  },
  {
    q: "I'm starting to run again after a long break. Should I start with Fleet Feet or GRYT?",
    a: "Either can work. If you want a coach and a plan, Fleet Feet's No Boundaries 5K programs are paid and coach-led, and its 2026 spring and summer sessions were designed for anyone new to running or walking. If you want a free group where walking is normal, GRYT Run Club is no-drop with no clock, so you can do walk-run intervals and turn around early. Either way, start with walk-run intervals and build up over several weeks.",
  },
];

export const Route = createFileRoute(
  "/resources_/playbooks_/fleet-feet-pittsburgh-vs-independent-run-clubs",
)({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Fleet Feet Pittsburgh, Fleet Feet running group, independent run club Pittsburgh, GRYT Run Club, South Hills running club, McMurray running club, Montour Trail run club, Peters Township run club, free running club Pittsburgh, Saturday morning run Pittsburgh",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: `${SITE}${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:modified_time", content: MODIFIED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Community" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE}${ogImage}` },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline:
            "GRYT Run Club vs Fleet Feet Pittsburgh: Which Free Run Club Fits You?",
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
          image: `${SITE}${ogImage}`,
          about: ["Fleet Feet Pittsburgh", "GRYT Run Club", "Pittsburgh running"],
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
            { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE}/resources` },
            { "@type": "ListItem", position: 2, name: "Playbooks", item: `${SITE}/resources/playbooks` },
            {
              "@type": "ListItem",
              position: 3,
              name: "GRYT Run Club vs Fleet Feet Pittsburgh",
              item: URL,
            },
          ],
        }),
      },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
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
          <p className="eyebrow text-foreground mt-8 mb-5">COMMUNITY · 9 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            GRYT Run Club vs Fleet Feet Pittsburgh: Which Free Run Club Fits You?
          </h1>
          <p className="mt-7 text-foreground/75 text-lg md:text-xl leading-[1.55]">
            {DESCRIPTION}
          </p>

          <ShareBar className="mt-8" />

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-foreground/15 p-5"
          >
            <p className="eyebrow text-foreground/70 mb-3">In this playbook</p>
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
            <p>You're standing in a parking lot at 6:58 AM, coffee still at home, wondering if you picked the right group. It's a fair question. Pittsburgh has options now: retail-backed clubs, free independents, city runs, trail runs. And if you're in the South Hills, a lot of those options are 45 minutes away before you've even tied your shoes.</p>
            <p>Here's a straight breakdown of what Fleet Feet Pittsburgh's running group offers, what independent clubs offer, and where GRYT Run Club fits if you're a South Hills or Washington County runner who wants community without the commute.</p>
            <div className="border-l-2 border-blue pl-5">
              <p className="font-bold text-foreground">Quick answer: GRYT Run Club vs Fleet Feet Pittsburgh</p>
              <p className="mt-2">Both are free to run with. Fleet Feet Pittsburgh is a store-backed club with weeknight runs in the East End, a Sunday 7:30 AM long run from rotating spots, and optional paid training programs. GRYT Run Club is independent, meets one time every week (Saturday at 7 AM on the Montour/Peters Trail in McMurray), welcomes walkers, and never drops anyone. If you live near the East End and want several runs a week, start with Fleet Feet. If you want a Saturday morning ritual in the South Hills, start with GRYT. Plenty of people do both.</p>
              <p className="mt-2 text-foreground/75 text-[14px]">
                Updated November 10, 2026. Fleet Feet details come from Fleet Feet Pittsburgh's{" "}
                <a href="https://www.fleetfeet.com/s/pittsburgh/training" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">Run With Us</a>,{" "}
                <a href="https://www.fleetfeet.com/s/pittsburgh/news" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">news</a>, and{" "}
                <a href="https://www.finalsurge.com/coach/fleetfeetpittsburgh/training/programs" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">training program</a>{" "}
                pages, last verified November 10, 2026. Fleet Feet says an updated run club schedule is coming, so
                confirm times on its calendar before you go.
              </p>
            </div>

            <h2 id="fleet-feet-offers" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">What Fleet Feet Pittsburgh's Running Group Offers</h2>
            <p>Fleet Feet Pittsburgh is retail-backed and anchored to the East End of the city. Its club runs are free when you join with code FREECLUB, and the weekly schedule on its Run With Us page looks like this:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Monday recovery runs, three miles from the Bakery Square store, 6:30 PM</li>
              <li>Wednesday track club, an interval workout at Schenley Oval, 6:30 PM</li>
              <li>Thursday East End pub runs, three and six mile routes from Bakery Square, 6:30 PM</li>
              <li>Sunday long runs, rotating locations, 7:30 AM, with three, six, and ten mile routes</li>
            </ul>
            <p>Four days a week of free programming is real. Worth saying plainly. If you live near Squirrel Hill, Shadyside, or anywhere in the East End, that schedule is convenient and well-organized.</p>
            <p>The Sunday long run is the most beginner-friendly of the four. Fleet Feet's page lists team leads from 7:00 per mile down to walk/jog intervals, plus a walking division.</p>

            <h3 id="paid-side" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">The Paid Side</h3>
            <p>
              Fleet Feet also sells coached training programs through the year. Its{" "}
              <a href="https://www.finalsurge.com/coach/fleetfeetpittsburgh/training/programs" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">2026 program list</a>{" "}
              included No Boundaries 5K programs at $125 to $150, Pittsburgh Marathon and Half Marathon training at
              $150 and $125, an eight-week Winter Warriors session at $75, and 12 and 16 week half and full marathon
              programs at $175 and $200. If you want a training plan, a coach, and a race-day target, that's what
              those programs are built for.
            </p>
            <p>The free club runs and the paid programs serve different purposes. Club runs are social. Training programs are performance-focused. That distinction matters when you're figuring out what you actually need.</p>

            <h3 id="geographic-reality" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">The Geographic Reality</h3>
            <p>Fleet Feet's weeknight runs start from Bakery Square and Schenley Oval in the East End, and the Sunday long run rotates. Fleet Feet does have a South Hills store at 1751 N. Highland Road, and it uses it for some events, including the Sunday long run on November 15, 2026. As of November 10, 2026, though, its Run With Us page doesn't list a weekly South Hills run. If you're in McMurray, Peters Township, or Canonsburg, the East End runs mean a 30 to 45 minute drive each way. If that drive or a weeknight start doesn't work for your family, that's the gap a Saturday morning club fills.</p>

            <h2 id="independent-offers" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">What Independent Run Clubs Offer</h2>
            <p>Independent clubs, with no retail sponsor, no store affiliation, and no paid programs attached, operate differently. The best ones are built around a specific time, place, and culture rather than a product ecosystem.</p>
            <p>The tradeoff is usually structure. You won't get a 16-week training plan or coached track workouts. What you get instead is consistency, low friction, and a group that shows up for the same reason you do: because running alone stopped working.</p>

            <h3 id="worth-joining" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">What Makes an Independent Club Worth Joining</h3>
            <p>The best ones share a few things. Same time every week. No one gets dropped. Free, always. And the post-run social is actually good, not an afterthought.</p>
            <p>Those aren't small things. Consistency builds habit. Not being dropped keeps newer runners coming back. Free means no weekly decision to make. And a real post-run ritual gives people a reason to stay.</p>

            <h2 id="gryt" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">GRYT Run Club: The South Hills Independent</h2>
            <p>GRYT Run Club meets every Saturday at 7 AM on the Montour/Peters Trail in McMurray. About four miles, flat, out and back. Walkers, joggers, and runners all go at whatever pace works for them. Nobody gets dropped. It's always free.</p>
            <p>After the run, people hang out in the parking lot with coffee. No agenda. No pitch. Just the kind of conversation that happens when you've just done something hard together.</p>
            <p>GRYT was founded by Laura and Nick Merich, who have 27 combined marathon finishes. They built it because the South Hills had no consistent, free, trail-based run club, and because Saturday at 7 AM, before the day takes over, is a window that actually works for people with full lives.</p>

            <h3 id="saturday-7am" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">Why Saturday at 7 AM Matters</h3>
            <p>Most people with kids or demanding schedules can't reliably make a 6:30 PM weeknight run. Something always comes up. Saturday at 7 AM is different. The house is quiet. The day hasn't started. You can be back by 9 AM with the run done and coffee already had.</p>
            <p>That timing isn't an accident. It's the whole point.</p>

            <h3 id="trail" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">The Trail</h3>
            <p>The Montour/Peters Trail is flat and beginner-friendly. For someone coming back after years off, that matters. There's no hill waiting to blow up your first run back. By mile two, the trail opens up and conversations get real. Pace stops being the subject and life takes over. That's usually the mile where people decide they're coming back next week.</p>

            <h2 id="who-fleet-feet" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">Who Should Choose Fleet Feet Pittsburgh</h2>
            <p>Fleet Feet is the right call if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You live in or near Pittsburgh's East End and the commute is no issue</li>
              <li>You want weeknight runs with a structured, consistent schedule</li>
              <li>You're training for a race and want a coached program ($75 to $200 in 2026)</li>
              <li>You're new to running or coming back, and you'd rather follow a coach than figure it out alone</li>
              <li>You want track workouts or pace-group accountability</li>
              <li>You're drawn to a larger, more established club with retail support</li>
            </ul>
            <p>The free club runs are genuinely accessible. The paid programs are well-organized. If East End geography works for you and you want race-specific training, Fleet Feet delivers.</p>

            <h2 id="who-gryt" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">Who Should Choose GRYT</h2>
            <p>GRYT is the right call if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You're in McMurray, Peters Township, Upper St. Clair, Bethel Park, or anywhere in Washington County</li>
              <li>Saturday morning is your best window and weeknight runs don't fit your schedule</li>
              <li>You want a trail run, not a road or track workout</li>
              <li>You're a former athlete, a busy parent, or a comeback runner who wants community without competition</li>
              <li>You want zero cost, zero pace pressure, and coffee after with no sales pitch attached</li>
            </ul>
            <p>GRYT is the free Saturday morning trail run based in McMurray and Peters Township. If you're in that corner of the South Hills, the real choice usually isn't Fleet Feet vs. GRYT. It's GRYT vs. running alone on Saturday.</p>

            <h2 id="comeback" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">Coming Back After a Long Break</h2>
            <p>If you're easing back in after months or years off and you want a group that won't judge your pace, you have two good routes here. They aren't the same thing.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">A coached program.</strong> Fleet Feet's No Boundaries 5K programs are paid and coach-led, with mentors and a group training for the same race. Its 2026 spring and summer sessions cost $125 and were designed for anyone new to running or walking.
              </li>
              <li>
                <strong className="text-foreground">A free no-drop group.</strong> GRYT has no program to sign up for. You show up on Saturday, do your own walk-run intervals on a flat out-and-back, turn around when you've had enough, and stay for coffee. Nobody asks what pace you run.
              </li>
              <li>
                <strong className="text-foreground">A free long run with a walking division.</strong> Fleet Feet's Sunday 7:30 AM run lists team leads down to walk/jog intervals, plus a walking division.
              </li>
            </ul>
            <p>
              Whichever you pick, the first few weeks should be mostly walking with short jogs. Our guide on{" "}
              <Link
                to="/resources/articles/$slug"
                params={{ slug: "start-running-again-after-a-long-break" }}
                className="text-foreground underline underline-offset-4"
              >
                how to start running again after a long break
              </Link>{" "}
              has a six-week walk-run plan, the aches that are fine and the ones that aren't, and a checklist for picking a group.
            </p>

            <h2 id="comparison" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">The Honest Comparison</h2>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-[14px] md:text-[15px] border-collapse">
                <thead>
                  <tr className="border-b border-foreground/25">
                    <th className="text-left py-2 px-2 font-bold"> </th>
                    <th className="text-left py-2 px-2 font-bold">Fleet Feet Pittsburgh</th>
                    <th className="text-left py-2 px-2 font-bold">GRYT Run Club</th>
                  </tr>
                </thead>
                <tbody className="text-foreground/85">
                  {[
                    ["Cost", "Free club runs; paid training programs from $75 to $200 in 2026", "Always free"],
                    ["Schedule", "Weeknights + Sunday long run", "Every Saturday"],
                    ["Time", "6:30 PM weeknights / 7:30 AM Sunday", "7:00 AM Saturday"],
                    ["Location", "Mostly East End (Bakery Square, Schenley Oval), rotating Sunday spots", "McMurray, Montour/Peters Trail"],
                    ["Format", "Road, track, pub run", "Trail, out-and-back"],
                    ["Post-run", "Pub (Thu) / varies", "Coffee in the parking lot"],
                    ["Slower paces", "Sunday long run has team leads down to walk/jog intervals and a walking division", "No-drop, walkers welcome, no clock"],
                    ["Coaching", "Paid programs available", "No, peer-led"],
                    ["South Hills presence", "Store at 1751 N. Highland Road; no weekly South Hills run listed as of November 10, 2026", "Home base: McMurray / Peters Township"],
                  ].map(([k, a, b]) => (
                    <tr key={k} className="border-b border-foreground/10 align-top">
                      <td className="py-2 px-2 font-semibold text-foreground">{k}</td>
                      <td className="py-2 px-2">{a}</td>
                      <td className="py-2 px-2">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Neither club is better in the abstract. They serve different people in different places at different times.</p>
            <p>
              They also aren't rivals. Fleet Feet{" "}
              <a href="https://www.fleetfeet.com/s/pittsburgh/news/fleet-feet-to-host-gryt-run-club" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">announced</a>{" "}
              that it would host GRYT Run Club for an easy three-mile run at its South Hills store on Thursday,
              November 19, 2026.
            </p>

            <h2 id="one-more" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">One More Thing Worth Saying</h2>
            <p>If you've been out of consistent running for a while, the first question isn't which club has the better training plan. It's which club you'll actually show up to. Proximity matters. Timing matters. Feeling like you belong on day one matters.</p>
            <p>Most people who join GRYT come alone the first time. That's fine. So did everyone else.</p>

            <h2 id="faqs" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">FAQs</h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <p className="font-bold text-foreground">{f.q}</p>
                  <p className="mt-2 text-foreground/80">{f.a}</p>
                </div>
              ))}
            </div>

            <p className="mt-10">Saturday at 7 AM, the parking lot at the Montour/Peters Trail is quiet for about three minutes. Then shoes hit gravel and the run starts. By mile two, nobody's thinking about which club they picked. They're just running.</p>
            <p>
              If you're in the South Hills and you've been looking for a reason to show up, this is it. RSVP for this Saturday at{" "}
              <Link to="/" className="text-foreground underline underline-offset-4">
                grytrunclub.com
              </Link>
              .
            </p>
          </div>

          <ShareBar className="mt-12" label="Share this playbook" />

          <div className="mt-12 flex flex-wrap gap-4">
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

function ShareBar({
  className = "",
  label = "Share",
}: {
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  // Bump SHARE_VERSION when og:image / title / description change to force
  // X, Facebook, and LinkedIn to re-scrape instead of serving a cached preview.
  const SHARE_VERSION = "2026-02-03";
  const UTM_CAMPAIGN = "fleet-feet-vs-independent";

  function withUtm(medium: string) {
    const params = new URLSearchParams({
      v: SHARE_VERSION,
      utm_source: medium === "copy" ? "copy" : medium,
      utm_medium: medium === "copy" ? "copy-link" : "social",
      utm_campaign: UTM_CAMPAIGN,
      utm_content: "playbook-share-bar",
    });
    return `${URL}?${params.toString()}`;
  }

  const copyUrl = withUtm("copy");
  const xUrl = withUtm("twitter");
  const fbUrl = withUtm("facebook");
  const liUrl = withUtm("linkedin");

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    TITLE,
  )}&url=${encodeURIComponent(xUrl)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    fbUrl,
  )}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    liUrl,
  )}`;

  async function onCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyUrl);
      } else {
        const el = document.createElement("textarea");
        el.value = copyUrl;

        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const btn =
    "inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] border border-foreground/30 text-foreground hover:border-blue hover:text-foreground/70 transition-colors";

  return (
    <div className={className} aria-label={label}>
      <p className="eyebrow text-foreground/70 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={onCopy} className={btn} aria-live="polite">
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <LinkIcon size={14} aria-hidden="true" /> Copy link
            </>
          )}
        </button>
        <a href={xHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2H21l-6.51 7.44L22 22h-6.83l-4.77-6.23L4.8 22H2l6.96-7.95L2 2h6.91l4.33 5.73L18.24 2Zm-1.197 18h1.671L7.05 4h-1.79l11.787 16Z" />
          </svg>
          X
        </a>
        <a href={fbHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on Facebook">
          <Facebook size={14} aria-hidden="true" /> Facebook
        </a>
        <a href={liHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on LinkedIn">
          <Linkedin size={14} aria-hidden="true" /> LinkedIn
        </a>
      </div>
    </div>
  );
}
