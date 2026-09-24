import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import ogImage from "@/assets/og-playbooks.jpg";
import { SITE_ORIGIN } from "@/lib/site";

const SITE = SITE_ORIGIN;
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
  href?: string;
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
    slug: "human-moat",
    title: "The Human Moat: Why the Future of Business Happens in a Parking Lot",
    category: "Business",
    readTime: "10 min read",
    description:
      "In an era of infinite synthetic noise, the only asset that remains truly un-automatable is the weight of real-life connection. The future of value is not found in a feed; it is found in the people who know your name in the physical world.",
    body: [
      "The 7 AM Revelation",
      "At 7:00 AM on the Montour Trail in McMurray, the world is reduced to its most essential elements. The air carries a biting, crystalline chill that catches in your throat, and the only soundtrack is the rhythmic crunch of gravel beneath shoes and the quiet plumes of breath visible in the gray light. There is a profound silence here that is increasingly rare in our hyper-connected lives. There is no stage, no registration table, no velvet rope, and no elaborate marketing apparatus.",
      "It is a primitive architecture of community. In this quietude, we find a revelation that challenges the very foundation of modern digital strategy. While the business world is obsessed with the digital frontier, the most significant shift is happening in the physical world. As we stand in the cold, we realize that in an era of infinite synthetic noise, the only asset that remains truly un-automatable is the weight of real-life connection. The future of value is not found in a feed; it is found in the people who know your name in the physical world.",
      "The Content Trap: Why 'More' is the Wrong Strategy",
      "Founders and strategists are currently trapped in a reactive loop. Confronted with the rising tide of Artificial Intelligence, the instinctive response has been to increase the volume — more posts, more channels, more newsletters, more 'presence.' It is an attempt to out-produce a machine that has a marginal cost of zero. By pursuing this 'more' strategy, human creators inadvertently strip away their own humanity, becoming nothing more than louder, less efficient versions of the same algorithms they seek to defeat.",
      "We are witnessing the total commoditization of the digital word. As the barrier to entry for content vanishes, the value of that content also trends toward zero. AI is making content cheaper every day, which means the most valuable thing left is the thing that cannot be automated: people who know your name in real life.",
      "The Container vs. The Product: Redefining Value",
      "To understand the architecture of a 'human moat,' we must decouple the activity from the value. Consider the model of GRYT. It functions without the traditional markers of an organized event — there are no pace groups, no fees, and no complex funnels designed to capture lead data. On the surface, it appears to be a running group, but the run is merely the 'container.' It is the vessel, not the product itself.",
      "The true product being offered is a trinity of human needs that AI can never fulfill:",
      "Accountability: The external, social pressure to honor a commitment to others.",
      "Familiarity: The compounding comfort of being recognized and known over time.",
      "Presence: The specific, powerful reassurance of knowing that someone would notice — and care — if you simply didn't show up.",
      "The Parking Lot Metric: Identifying the Real Signal",
      "In the digital economy, we have been conditioned to worship at the altar of click-through rates and impression counts. But these are low-fidelity signals. The true metric of a human moat is found in the 'parking lot phenomenon.'",
      "On the Montour Trail, the most striking data point isn't the distance covered or the pace maintained; it is the fact that people stay in the parking lot talking long after the run has concluded. They often linger in conversation for a greater duration than the run itself. This lingering is the ultimate signal of success. It is an organic, unscripted interaction that defies growth hacks and cannot be manufactured by an automated funnel. It is the sound of a community solidifying in real-time.",
      "The 7:52 AM Test: What AI Can Never Copy",
      "The fundamental limitation of technology is its inability to occupy physical space or provide the sanctuary of true presence. An AI can be trained to mimic your brand voice with terrifying precision; it can synthesize your writing style and summarize your lifetime of work in seconds. It can scale your ideas to millions, but it cannot scale the intimacy of a shared moment.",
      "The machine fails the 7:52 AM test. It cannot stand beside a friend in a gravel parking lot as the sun begins to break through the trees and ask how their week actually went. It cannot offer the silence, the eye contact, or the genuine empathy of a person who has physically sacrificed their Saturday morning to be there. 'People who know your name in real life' is the ultimate competitive advantage because it is the only thing the machine cannot simulate, substitute, or scale.",
      "Choosing 'Less Scale, More Saturdays'",
      "The path forward requires a radical act of defiance against the current digital economy. It requires a strategic pivot from the pursuit of digital volume to the cultivation of human depth. We must stop trying to be louder versions of the machine and start being more intentional versions of ourselves.",
      "The future belongs to those who understand that intimacy is the only thing that doesn't scale — and that is exactly why it is the only thing that matters.",
      "Less scale. More Saturdays.",
      "In a world where content is infinite, who is actually waiting for you to show up at 7 AM?",
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
  {
    slug: "find-a-running-club",
    title: "How to Find a Running Club That Actually Fits Your Life",
    category: "Community",
    readTime: "7 min read",
    description:
      "The no-BS guide to picking a run club: schedule, pace, cost, post-run culture, and what to watch out for.",
    body: [
      "At some point, fitness got lonely. The solo treadmill sessions, the runs you kept postponing, the apps you stopped opening. You know you'd show up more if someone else was showing up too.",
      "That's exactly why people go looking for a run club. But not all of them are worth your Saturday morning.",
      "Here's what to actually look for.",
      "Start With the Schedule, Not the Vibe",
      "A run club with a great Instagram and an inconsistent schedule is just a nice idea. The best way to find a running club that sticks is to find one that runs on a fixed day, at a fixed time, every single week.",
      "That predictability is what turns one run into a habit. You stop deciding whether to go. It's just what you do on Saturday.",
      "Ask before you commit: Does this group run every week, or every other week? Does the location change? If the answer to either is \"it depends,\" that's useful information.",
      "Watch Out for Pace Pressure",
      "Some clubs are quietly competitive. Nothing is ever said out loud, but the faster runners are always out front, the slower ones trail off, and nobody waits.",
      "A good run club keeps the group together. Look for language like \"all paces welcome\" or \"no one gets dropped\" — and then verify it actually happens. Read reviews, ask someone who's been, or just show up once and see how the group handles the back of the pack.",
      "If you've been away from running for a while, or you're coming back after kids or an injury, pace pressure is the fastest way to stop going.",
      "Free Is Better Than You Think",
      "Plenty of local running clubs are completely free. No membership fees, no gear requirements, no subscription. If a club is charging you monthly to run outside with other people, it's worth asking what exactly you're paying for.",
      "Free clubs tend to attract people who are there for the right reasons. They're not protecting an investment. They just want to run with good people.",
      "The Post-Run Matters as Much as the Miles",
      "This sounds small, but it isn't. The 15 minutes in the parking lot after the run — coffee, water, people catching their breath and actually talking — that's where the consistency comes from. That's the part that makes you want to come back.",
      "Look for a club that has some version of this. A coffee spot nearby, a loose hang after, anything that extends the run into something social. The miles get you fit. The parking lot keeps you coming.",
      "If You're in the South Hills, There's Already a Standing Invite",
      "GRYT Run Club runs every Saturday at 7 AM on the Montour/Peters Trail in McMurray, PA. It's free, always. No pace requirement. Nobody gets dropped. The run is about 4 miles out and back on a flat, beginner-friendly trail, and there's coffee after in the lot.",
      "7–15 people show up most weeks. You RSVP online, get one reminder Friday and one Saturday morning, and that's the whole system. No spam, no pressure.",
      "It was built by Laura and Nick Merich, who have 27 combined marathons between them and started the club because they needed it themselves. That's the whole origin story.",
      "If Saturday morning in the South Hills sounds right, the RSVP is at grytrunclub.com.",
      "FAQs",
      "What is the best way to find a running club near me? Search for local run clubs on Google, Strava, or Facebook groups specific to your neighborhood. Look for clubs with a fixed weekly schedule, a clear location, and an all-paces policy. Showing up once is the fastest way to know if it fits.",
      "Are most running clubs free to join? Many local run clubs are completely free. Some charge fees for organized training programs or race preparation, but casual community run clubs typically have no cost to attend.",
      "What should a beginner look for in a run club? Look for a group that explicitly welcomes all paces, doesn't drop slower runners, and has a consistent schedule. A flat, familiar route and a welcoming post-run hangout are good signs the group is built for people, not performance.",
      "How do I know if a run club is too competitive for me? Check how the group describes itself. Phrases like \"no pace requirement\" and \"no one gets dropped\" are good indicators. If the club's language centers on PRs, race training, or pace groups without mentioning casual runners, it may skew more competitive.",
      "Is there a free run club in McMurray or the South Hills of Pittsburgh? Yes. GRYT Run Club runs every Saturday at 7 AM on the Montour/Peters Trail in McMurray, PA. It's free, all paces are welcome, and you can RSVP at grytrunclub.com.",
      "What if I haven't run in a long time? Most community run clubs are designed for exactly this situation. A group that runs at multiple paces and keeps everyone together is a good fit for comeback runners. The social accountability tends to help more than any training plan.",
      "How many people are usually at a local run club? It varies widely. Smaller neighborhood clubs might draw 7–15 people on a given Saturday, which is often ideal for actually getting to know people. Larger city clubs can have dozens of runners, which suits people who prefer more anonymity.",
    ],
  },
  {
    slug: "best-free-run-clubs-south-hills-2026",
    title: "Best Free Run Clubs in Pittsburgh's South Hills (2026 Guide)",
    category: "Community",
    readTime: "8 min read",
    description:
      "Which South Hills run clubs are actually free, when they meet, and how GRYT, Yinz, City of Bridges, and Strava compare on cost, schedule, and drop policy.",
    body: [],
    href: "/resources/playbooks/best-free-run-clubs-south-hills-2026",
  },
  {
    slug: "best-free-running-clubs-pittsburgh-2026",
    title: "The Best Free Running Clubs in Pittsburgh (2026)",
    category: "Community",
    readTime: "9 min read",
    description:
      "A no-BS guide to Pittsburgh's free running clubs in 2026 — Yinz, Fleet Feet, Steel City, Kool, Pharaoh Hounds, and GRYT. Who they're for, when they meet, and what makes each one worth your Saturday.",
    body: [],
    href: "/resources/playbooks/best-free-running-clubs-pittsburgh-2026",
  },
  {
    slug: "saturday-runs-what-to-expect",
    title: "GRYT Run Club Saturday Runs: What to Expect on the Montour and Peters Trails",
    category: "Community",
    readTime: "7 min read",
    description:
      "The route, when and where to show up, the no-drop format, post-run coffee, and what to bring to a GRYT Saturday run in McMurray.",
    body: [],
    href: "/resources/playbooks/saturday-runs-what-to-expect",
  },
  {
    slug: "gryt-vs-yinz-run-club",
    title: "GRYT vs Yinz Run Club: Which Pittsburgh Run Club Is Right for You?",
    category: "Community",
    readTime: "8 min read",
    description:
      "An honest comparison of Yinz Run Club and GRYT Run Club — location, schedule, group size, and post-run culture. Figure out which Pittsburgh run club actually fits your life.",
    body: [],
    href: "/resources/playbooks/gryt-vs-yinz-run-club",
  },
  {
    slug: "fleet-feet-pittsburgh-vs-independent-run-clubs",
    title: "Fleet Feet Pittsburgh Running Group vs Independent Run Clubs — Which Should You Join?",
    category: "Community",
    readTime: "9 min read",
    description:
      "An honest breakdown of Fleet Feet Pittsburgh's running group, independent run clubs, and where GRYT fits if you're a South Hills runner who wants community without the commute.",
    body: [],
    href: "/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs",
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

      <section className="px-6 sm:px-12 lg:px-24 pt-16 pb-8 border-b border-paper/15">
        <div className="max-w-[900px] mx-auto">
          <p className="eyebrow text-paper/55 mb-5">Jump to a playbook</p>
          <nav aria-label="Playbook table of contents">
            <ul className="flex flex-col gap-3">
              {PLAYBOOKS.filter((p) => !p.comingSoon).map((p) => {
                return (
                  <li key={p.slug}>
                    {p.href ? (
                      <Link
                        to={p.href}
                        className="group flex items-center gap-3 text-paper/80 hover:text-blue transition-colors"
                      >
                        <span className="w-2 h-2 bg-paper/40 group-hover:bg-blue transition-colors" />
                        <span className="text-[16px] md:text-[17px] leading-[1.5]">
                          {p.title}
                        </span>
                      </Link>
                    ) : (
                      <a
                        href={`#${p.slug}`}
                        className="group flex items-center gap-3 text-paper/80 hover:text-blue transition-colors"
                      >
                        <span className="w-2 h-2 bg-paper/40 group-hover:bg-blue transition-colors" />
                        <span className="text-[16px] md:text-[17px] leading-[1.5]">
                          {p.title}
                        </span>
                      </a>
                    )}
                  </li>
                );
              })}

            </ul>
          </nav>
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
              {p.href && (
                <Link
                  to={p.href}
                  className="mt-8 inline-flex items-center gap-2 text-blue hover:text-paper transition-colors text-sm font-bold uppercase tracking-[0.12em]"
                >
                  Read the full article →
                </Link>
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
          <Link to="/" hash="join" className="btn-primary">
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
