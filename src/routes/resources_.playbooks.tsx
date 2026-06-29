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
    slug: "best-free-running-clubs-pittsburgh-2026",
    title: "The Best Free Running Clubs in Pittsburgh (2026)",
    category: "Community",
    readTime: "9 min read",
    description:
      "A no-BS guide to Pittsburgh's free running clubs in 2026 — Yinz, Fleet Feet, Steel City, Kool, Pharaoh Hounds, and GRYT. Who they're for, when they meet, and what makes each one worth your Saturday.",
    body: [
      "You used to have a team. Then life got complicated — kids, commutes, a schedule that treats anything non-urgent as optional. But the part of you that needs to move, that needs people to move with, doesn't really disappear. It just waits.",
      "Pittsburgh has a real running community. It's spread across neighborhoods and suburbs, split between early risers and evening runners, trail people and road people. Some clubs cost money. Most are city-centric. A few are genuinely free and genuinely welcoming.",
      "Here's what's actually out there in 2026 — who each club is for, when and where they meet, and what makes each one worth considering.",
      "Yinz Run Club",
      "Yinz is Pittsburgh's largest free running community, with more than 2,500 members. If you've spent any time in the city's running scene, you've probably already heard the name.",
      "They meet Wednesday evenings and bi-weekly Saturdays at 10 AM, rotating routes through city neighborhoods. The group is inclusive and well-organized, with a strong social culture built around post-run hangs.",
      "Best for: City-based runners who can make a weeknight work, or who want a large, established group with a real social scene.",
      "Cost: Free.",
      "Limitation: Every run is city-centric. If you're in the South Hills, Peters Township, or Washington County, you're adding a commute before you even lace up. The Saturday 10 AM slot also doesn't work well for parents who need to be back before the day takes over.",
      "Fleet Feet Pittsburgh",
      "Fleet Feet runs a free weekly group run out of their East End location. The retail backing shows — solid infrastructure, mapped routes, consistent scheduling.",
      "Best for: Runners who want a structured, beginner-friendly setup with gear and coaching resources close by.",
      "Cost: Free with registration.",
      "Limitation: Anchored to the East End. If you're in Bethel Park, Upper St. Clair, or McMurray, this isn't your neighborhood option — it's a trip.",
      "Steel City Road Runners",
      "One of Pittsburgh's older running organizations. They host events and group runs throughout the year, with a suggested $20 annual donation rather than a hard membership fee.",
      "Best for: Runners who want to connect with a broader Pittsburgh racing community and get involved in organized events.",
      "Cost: $20 suggested donation per year.",
      "Limitation: Meets only a few times per year. If you're looking for something that shows up on your calendar every single Saturday and holds you to it, this isn't that.",
      "Kool Run Club",
      "Kool Run Club brings a different energy to Pittsburgh running — free, community-oriented, with a following built around runners who want the social side of the sport front and center.",
      "Best for: Runners who want a personality-driven group with a strong social identity.",
      "Cost: Free.",
      "Limitation: Check their current schedule directly, as meeting times and locations can shift. Not a South Hills option.",
      "Pittsburgh Pharaoh Hounds",
      "The Pharaoh Hounds meet Tuesday evenings and have a reputation for being welcoming at every pace. They've built a consistent following among Pittsburgh runners who want a midweek group run with real regulars.",
      "Best for: Runners who can commit to a Tuesday evening and want a group with history behind it.",
      "Cost: Free.",
      "Limitation: Tuesday evenings are hard for a lot of parents and people with demanding schedules. And like most Pittsburgh clubs, the Pharaoh Hounds don't have a South Hills or Washington County presence.",
      "GRYT Run Club — McMurray / South Hills",
      "Here's the honest gap in Pittsburgh's running scene: almost nothing consistently serves the South Hills suburbs on a Saturday morning.",
      "McMurray, Peters Township, Upper St. Clair, Bethel Park — these neighborhoods are full of former athletes, busy parents, and people who used to run and want to again. They don't need another Wednesday evening option that requires driving into the city first. They need something close, early, and free.",
      "That's what GRYT Run Club is.",
      "GRYT meets every Saturday at 7 AM on the Montour / Peters Trail in McMurray. The route is an out-and-back covering roughly four miles on a flat, beginner-friendly trail. Walkers, joggers, and runners all show up. No one gets dropped. No one has ever been dropped.",
      "After the run, people hang out in the parking lot with coffee. No agenda. No pitch. Just the natural end of a Saturday morning well spent.",
      "Who Started It",
      "GRYT was founded by Laura and Nick Merich, who have 27 combined marathon finishes between them. They're not coaches with a program to sell. They're former athletes who got busy, missed having a team, and decided to build something instead of waiting for someone else to.",
      "What Makes It Different",
      "The combination is specific: zero cost, 7 AM Saturday, a flat trail in the South Hills, and coffee after. No Pittsburgh-area club currently owns that combination.",
      "The 7 AM start matters more than it sounds. You're done by 8:15. The rest of Saturday is still yours — kids' activities, errands, whatever the day demands. You didn't sacrifice the morning. You started it.",
      "The Montour / Peters Trail matters too. It's accessible, well-maintained, and close to home for anyone in the Peters Township and South Hills corridor. You're not driving 30 minutes to run.",
      "What to Expect Your First Time",
      "Show up ten minutes early. A founder or regular will find you before the run starts. You won't be standing at the edge of a group mid-warmup wondering where to put yourself.",
      "By mile two, the conversations are usually less about running and more about everything else — work, kids, the week you just had. That's the part people come back for.",
      "The RSVP system is simple: fill out the form at grytrunclub.com, get one reminder Friday evening, and one nudge Saturday morning. That's it. No inbox flooding, no upsell.",
      "GRYT also has a Strava club (ID 1708552) where members log activity and stay connected between runs. Low-key and useful if you're already on Strava.",
      "Best for: Former athletes, busy parents, and comeback runners in Pittsburgh's South Hills and Washington County who want a free, weekly, early Saturday run with real people and coffee after.",
      "Cost: Always free. No membership. No fees.",
      "How These Clubs Compare",
      "Yinz Run Club — Free · Wed evenings & Sat 10 AM · City · Social post-run.",
      "Fleet Feet Pittsburgh — Free · Varies · East End · Varies.",
      "Steel City Road Runners — $20/yr donation · Occasional · City · Varies.",
      "Kool Run Club — Free · Varies · City · Social.",
      "Pittsburgh Pharaoh Hounds — Free · Tuesday evenings · City · Social.",
      "GRYT Run Club — Free · Saturday 7 AM · McMurray / South Hills · Coffee.",
      "If you're in the city and free on a Wednesday evening, Yinz Run Club is a strong choice. If you're in the South Hills and Saturday mornings are your window, GRYT is the only consistent free option on the Montour / Peters Trail corridor.",
      "The One Thing Worth Saying",
      "Most people who show up to GRYT for the first time come alone. That's fine. So did everyone else.",
      "The trail is flat. The coffee is real. The 7 AM start means you're back home before most people have had breakfast.",
      "If you've been waiting for a reason to start again, Saturday is a good one.",
      "RSVP for this Saturday at grytrunclub.com.",
      "Frequently Asked Questions",
      "Are there free running clubs in Pittsburgh? Yes. Several Pittsburgh-area running clubs are free, including Yinz Run Club, Kool Run Club, Pittsburgh Pharaoh Hounds, Fleet Feet Pittsburgh's group runs, and GRYT Run Club. Steel City Road Runners asks for a $20 annual donation but doesn't require it.",
      "What is the best running club for beginners in Pittsburgh? GRYT Run Club in McMurray is a strong option for beginners. The Montour / Peters Trail route is flat and forgiving, there are no pace requirements, and no one gets dropped. Walkers, joggers, and runners all go out together. Yinz Run Club and Fleet Feet Pittsburgh also welcome beginners.",
      "Is there a running club in Pittsburgh's South Hills? Yes. GRYT Run Club meets every Saturday at 7 AM on the Montour / Peters Trail in McMurray, PA, serving the South Hills and Washington County suburbs including Peters Township, Upper St. Clair, and Bethel Park. It's free and open to all paces.",
      "What time does GRYT Run Club meet? Every Saturday at 7 AM at the Montour / Peters Trail in McMurray, PA. First-timers are asked to arrive ten minutes early so a founder or regular can introduce themselves before the run starts.",
      "Does GRYT Run Club cost anything? No. GRYT Run Club is always free. No membership fees, no registration costs, no upsells.",
      "How do I join GRYT Run Club? Fill out the RSVP form at grytrunclub.com. You'll get one reminder Friday evening and one nudge Saturday morning. Show up ten minutes early your first time and someone will find you.",
      "What happens after the run at GRYT? People hang out in the parking lot with coffee. No agenda, no pitch — just a natural end to a Saturday morning run. It's one of the things that sets GRYT apart from every other Pittsburgh-area club.",
    ],
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
              {PLAYBOOKS.filter((p) => !p.comingSoon).map((p) => (
                <li key={p.slug}>
                  <a
                    href={`#${p.slug}`}
                    className="group flex items-center gap-3 text-paper/80 hover:text-blue transition-colors"
                  >
                    <span className="w-2 h-2 bg-paper/40 group-hover:bg-blue transition-colors" />
                    <span className="text-[16px] md:text-[17px] leading-[1.5]">
                      {p.title}
                    </span>
                  </a>
                </li>
              ))}
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
