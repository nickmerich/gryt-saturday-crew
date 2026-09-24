import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import ogImage from "@/assets/og-playbooks.jpg";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/playbooks/saturday-runs-what-to-expect`;
const HEADLINE = "GRYT Run Club Saturday Runs: What to Expect on the Montour and Peters Trails";
const TITLE = `${HEADLINE} · gryt run club`;
const DESCRIPTION =
  "What a GRYT Saturday run looks like: the Montour / Peters Trail route in McMurray, when and where to show up, the no-drop format, post-run coffee, and what to bring.";
const PUBLISHED = "2026-09-24";

const SECTIONS = [
  { id: "route", label: "The Route: Montour and Peters Trails in McMurray" },
  { id: "when-where", label: "What Time and Where to Show Up" },
  { id: "format", label: "The Format: What Actually Happens" },
  { id: "who", label: "Who Shows Up on Saturday Mornings" },
  { id: "bring", label: "What to Bring" },
  { id: "connected", label: "Staying Connected Between Runs" },
  { id: "only-option", label: "Is Saturday the Only Option?" },
  { id: "why", label: "Why This Matters for South Hills Runners" },
  { id: "faqs", label: "FAQs" },
];

const FAQS = [
  {
    q: "Do I need to RSVP before showing up?",
    a: "It's strongly encouraged. RSVPing gets you a reminder Friday and one on Saturday, and lets the crew know to look out for you. RSVP at grytrunclub.com.",
  },
  {
    q: "What pace do I need to run?",
    a: "There's no pace requirement. All paces are welcome, and the no-drop policy means the group stays together. You will not be left behind.",
  },
  {
    q: "Is there a membership fee?",
    a: "No. GRYT Run Club is completely free. No membership fee, no registration cost, no paid tier of any kind.",
  },
  {
    q: "What should I wear?",
    a: "Dress for the weather. Standard running shoes are all you need. No special gear required for Saturday mornings.",
  },
  {
    q: "What happens after the run?",
    a: "Coffee in the parking lot. It's a regular part of the morning, not an occasional thing.",
  },
  {
    q: "How do I find the exact meetup spot?",
    a: "Park in the Peterswood Park lot at 212 Valley Brook Road, McMurray, PA 15317 and meet by the trail map board. It's a free gravel lot.",
  },
  {
    q: "Can I join if I'm not from the South Hills?",
    a: "Yes. The club is based in McMurray and mostly serves the South Hills, but runners from anywhere in the Pittsburgh area are welcome.",
  },
];

export const Route = createFileRoute("/resources_/playbooks_/saturday-runs-what-to-expect")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "article:published_time", content: PUBLISHED },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: HEADLINE,
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          publisher: { "@type": "Organization", name: "gryt run club", url: SITE },
          mainEntityOfPage: URL,
          image: `${SITE}${ogImage}`,
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
    ],
  }),
  component: ArticlePage,
});

const H2 = "text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24";
const H3 = "text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24";

function ArticlePage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[760px] mx-auto">
          <Link to="/resources/playbooks" className="eyebrow text-blue hover:text-paper transition-colors">
            ← All playbooks
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">COMMUNITY · 7 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            {HEADLINE}
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">{DESCRIPTION}</p>

          <nav aria-label="Table of contents" className="mt-10 border border-paper/15 p-5">
            <p className="eyebrow text-paper/55 mb-3">In this playbook</p>
            <ul className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-paper/80 hover:text-blue transition-colors text-[15px]">
                    → {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-5 text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>If you've been looking for a Pittsburgh run club that doesn't involve driving into the city, sorting yourself into a pace bracket, or paying a membership fee, Saturday mornings on the Montour and Peters Trails are worth a look.</p>
            <p>GRYT Run Club meets every Saturday at 7 AM on the Montour / Peters Trail in McMurray, PA. Here's what the run actually looks like, who shows up, and what happens after.</p>

            <h2 id="route" className={H2}>The Route: Montour and Peters Trails in McMurray</h2>
            <p>Saturday runs cover about 4 miles out and back along the Montour / Peters Trail, a flat, publicly accessible trail through the South Hills. It's approachable for beginners and still useful for experienced runners logging easy base mileage. You're not navigating technical terrain or hunting for parking in Shadyside. You're running from a trailhead that's already in your neighborhood.</p>
            <p>For runners in McMurray, Canonsburg, Bethel Park, and Peters Township, a fixed weekly group this close to home is a meaningful difference.</p>

            <h2 id="when-where" className={H2}>What Time and Where to Show Up</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Time:</strong> 7 AM every Saturday</li>
              <li><strong>Location:</strong> Peterswood Park lot, 212 Valley Brook Road, McMurray, PA 15317. Free gravel lot. Meet by the trail map board.</li>
            </ul>
            <p>The easiest way to get ready for your first run is to RSVP at grytrunclub.com. You'll get a reminder Friday and another on Saturday.</p>

            <h2 id="format" className={H2}>The Format: What Actually Happens</h2>
            <h3 className={H3}>Before the Run</h3>
            <p>People start gathering just before 7 AM at the trailhead. The group is small by design, not by accident. You'll know people's names by your second Saturday.</p>
            <p>There's no formal warmup, no pace group assignment, no coach directing traffic. Founders Laura and Nick Merich organize the runs and are usually out there themselves.</p>
            <h3 className={H3}>During the Run</h3>
            <p>All paces are welcome, and GRYT actually means it. The club runs a strict no-drop policy: every runner finishes with the group. If you need to slow down, the group adjusts. If you need to walk a stretch, that's fine. Nobody gets left on the trail.</p>
            <p>At about 4 miles, most recreational runners are out somewhere between 35 minutes and an hour depending on pace. It's a manageable distance whether you're just getting back into a routine or using Saturday as an easy day while training for the Pittsburgh Marathon.</p>
            <h3 className={H3}>After the Run</h3>
            <p>Honestly, this part is worth showing up for on its own. Coffee in the parking lot after the run. It's a casual 15 to 20 minutes where people actually talk, which is rarer than it sounds in most running groups.</p>
            <p>If you're a former athlete who misses the conversation after practice, or a parent who rarely gets uninterrupted adult time, Saturday mornings tend to fill that gap in a way a solo run never quite does.</p>

            <h2 id="who" className={H2}>Who Shows Up on Saturday Mornings</h2>
            <p>The Saturday crowd is mostly people who want consistency without a lot of complexity. A few common profiles:</p>
            <p><strong>Former athletes</strong> who played team sports and miss having a fixed practice time with familiar faces. The small group and recurring schedule bring that structure back without a long-term commitment.</p>
            <p><strong>Busy parents</strong> who need a workout that starts and ends on a predictable clock. 7 AM on a Saturday is early enough to be home before the household fully wakes up.</p>
            <p><strong>Comeback runners</strong> getting back into consistent fitness after time off. No one is tracking your splits or asking about your race goals.</p>
            <p><strong>South Hills runners</strong> who are tired of adding 30 to 45 minutes of driving just to run with other people.</p>

            <h2 id="bring" className={H2}>What to Bring</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Running shoes</li>
              <li>Clothing for the weather</li>
              <li>Water if you usually carry it on a 4-mile run</li>
            </ul>
            <p>No gear requirements, no registration fee. First-timers sign a quick free waiver online before their first run.</p>

            <h2 id="connected" className={H2}>Staying Connected Between Runs</h2>
            <p>GRYT uses Strava to keep up between Saturdays. Join the club (ID 1708552) before your first run to get a feel for the group.</p>
            <p>If you RSVP, you'll get one reminder Friday and one Saturday. No inbox clutter.</p>

            <h2 id="only-option" className={H2}>Is Saturday the Only Option?</h2>
            <p>Right now, yes. Saturday at 7 AM is the one weekly GRYT run. Keeping it to one fixed time is what makes it easy to build into your week. Everything about the club is at grytrunclub.com.</p>

            <h2 id="why" className={H2}>Why This Matters for South Hills Runners</h2>
            <p>Most Pittsburgh run clubs are built around the urban core. That works if you live in Lawrenceville or Squirrel Hill, but it leaves a gap for anyone in the South Hills who doesn't want to add a 45-minute round trip to their Saturday morning run.</p>
            <p>GRYT exists for that gap. It's free, it runs on a fixed schedule, and it's on a trail that's already in your backyard. If you're looking for a Pittsburgh run club that actually serves the South Hills, this is it.</p>

            <h2 id="faqs" className={H2}>FAQs</h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <p className="font-bold text-paper">{f.q}</p>
                  <p className="mt-2 text-paper/80">{f.a}</p>
                </div>
              ))}
            </div>

            <p className="mt-10">Saturday at 7 AM on the Montour / Peters Trail is a simple, repeatable way to build a running habit with people who show up week after week. If that's what you've been looking for, RSVP for the next one.</p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">RSVP for Saturday →</Link>
            <Link
              to="/resources/playbooks"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
            >
              Back to Playbooks
            </Link>
          </div>
          <ShareButtons url={URL} title={TITLE} />
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
