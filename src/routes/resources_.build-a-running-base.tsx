import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import heroAsset from "@/assets/running-base-pittsburgh.png.asset.json";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/build-a-running-base`;
const HERO = `${SITE}${heroAsset.url}`;
const TITLE = "How to Build a Running Base Before Your First Race · gryt";
const DESCRIPTION =
  "How to build a running base before race training: how long it takes, how many days a week, what easy pace feels like, and when you're ready for a plan.";
const PUBLISHED = "2026-08-31";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "what", label: "What a running base actually means" },
  { id: "why", label: "Why the base phase matters more than people think" },
  { id: "how-long", label: "How long should your base phase be?" },
  { id: "framework", label: "Building your base: a simple framework" },
  { id: "easy", label: "What \u201Ceasy\u201D actually feels like" },
  { id: "mistakes", label: "Common mistakes to avoid" },
  { id: "ready", label: "When you're ready to train for a race" },
  { id: "group", label: "Running with others makes it easier" },
  { id: "faqs", label: "Frequently asked questions" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How long does it take to build a running base?",
    a: "For most new or returning runners, 8 to 12 weeks of consistent easy running three to four days per week is enough to establish a solid base. If you already run regularly, 4 to 6 weeks of stable mileage may be sufficient before starting a race plan.",
  },
  {
    q: "What pace should I run during base building?",
    a: "Easy pace — conversational, no gasping. On a perceived effort scale of 1 to 10, aim for a 4 or 5. Most beginners run their easy days too fast, which slows recovery and increases injury risk.",
  },
  {
    q: "Can I build a running base while training for a race?",
    a: "If your race is far enough out, yes. But if you're already registered for something in the next 8 weeks and haven't been running consistently, scale back expectations and focus on finishing safely rather than following a full training plan.",
  },
  {
    q: "How many days a week should I run during base building?",
    a: "Start with three days. Once that feels manageable for four to six weeks, add a fourth. More frequency beats longer individual runs when you're building from scratch.",
  },
  {
    q: "Is it okay to walk during runs in the base phase?",
    a: "Yes. Walk breaks are a tool, not a setback. Running for 2 minutes and walking for 1 is still training your body to adapt. As your fitness improves, the walk breaks naturally get shorter.",
  },
  {
    q: "What's the 10 percent rule and should I follow it?",
    a: "The 10 percent rule means not increasing your total weekly mileage by more than 10 percent from one week to the next. It's conservative, but it's widely used because it reduces overuse injury risk — and it's a good habit to build before race training adds more stress.",
  },
  {
    q: "How do I know when my base is ready for a training plan?",
    a: "When you can run three to four days a week consistently without soreness carrying over between sessions, and your easy runs feel genuinely comfortable. A long run of 3 to 4 miles without stopping is also a useful benchmark before starting most beginner race plans.",
  },
];

export const Route = createFileRoute("/resources_/build-a-running-base")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "running base, base building, how to start running, first race training, easy pace, 10 percent rule, beginner runner, Pittsburgh run club",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: HERO },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Training" },
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
          headline: "How to Build a Running Base Before Your First Race",
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          author: { "@type": "Person", name: "Nick Merich" },
          publisher: { "@type": "Organization", name: "gryt run club", url: SITE },
          mainEntityOfPage: URL,
          image: HERO,
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
            { "@type": "ListItem", position: 2, name: "Build a Running Base", item: URL },
          ],
        }),
      },
    ],
  }),
  component: RunningBasePage,
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-paper font-bold text-[18px] md:text-[20px] mt-8 mb-1.5">
      {children}
    </h3>
  );
}

function RunningBasePage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[760px] mx-auto">
          <Link to="/resources" className="eyebrow text-blue hover:text-paper transition-colors">
            ← All resources
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">TRAINING · 8 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            How to Build a Running Base Before Your First Race
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            The unglamorous weeks that decide whether race day feels good or
            feels like survival.
          </p>

          <figure className="mt-10 border border-paper/15">
            <img
              src={heroAsset.url}
              alt="Runner on a Pittsburgh road at dawn with the city skyline behind and a blue arrow climbing ahead"
              width={1536}
              height={1024}
              loading="eager"
              style={{ filter: "none" }}
              className="w-full h-auto"
            />
          </figure>

          <nav aria-label="Table of contents" className="mt-10 border border-paper/15 p-5">
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
              Most people who sign up for their first race make the same
              mistake: they skip straight to race-specific training and wonder
              why their legs feel wrecked by week three. Building a running base
              first changes everything. It's the difference between surviving a
              race and actually enjoying it.
            </p>
            <p>
              This guide covers what a running base actually is, why it matters
              before any training plan kicks in, and how to build one that fits
              a real schedule.
            </p>

            <H2 id="what">What a running base actually means</H2>
            <p>
              A running base is the period of consistent, easy running you do
              before structured race training begins. No intervals, no tempo
              runs, no pace targets. Just regular miles at a conversational
              effort, repeated week after week until your body adapts.
            </p>
            <p>
              Think of it as conditioning your tendons, joints, and
              cardiovascular system to handle what's coming. Muscles respond to
              training faster than connective tissue does. Jump straight into a
              5K or 10K plan without a base, and your lungs might keep up — but
              your knees and shins often won't.
            </p>

            <H2 id="why">Why the base phase matters more than people think</H2>
            <p>
              Race training plans are written assuming you already run
              consistently. A 10-week 5K plan assumes you can handle three days
              a week without breaking down. A half marathon plan assumes 20 to
              25 miles per week already in your legs.
            </p>
            <p>
              If you can't run three days in a row without soreness that lingers
              for days, the plan isn't your problem. The base is.
            </p>
            <p>A proper base phase does three things:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="text-paper font-bold">Builds aerobic capacity.</span>{" "}
                Easy miles teach your body to use oxygen efficiently, which
                makes every harder workout later feel more manageable.
              </li>
              <li>
                <span className="text-paper font-bold">Strengthens connective tissue.</span>{" "}
                Tendons and ligaments adapt slowly. Consistent low-intensity
                mileage over weeks is the only way to prepare them.
              </li>
              <li>
                <span className="text-paper font-bold">Creates the habit.</span>{" "}
                Running three times a week starts to feel normal before race
                training adds a fourth day or ramps up intensity.
              </li>
            </ul>

            <H2 id="how-long">How long should your base phase be?</H2>
            <p>It depends on where you're starting.</p>
            <p>
              <span className="text-paper font-bold">
                New to running or returning after a long break:
              </span>{" "}
              Give yourself 8 to 12 weeks of base building before starting a
              race-specific plan. That might feel like a long runway, but it
              dramatically reduces injury risk.
            </p>
            <p>
              <span className="text-paper font-bold">
                Running occasionally — once or twice a week:
              </span>{" "}
              Four to six weeks of consistent three-day weeks is usually enough
              to establish the base you need.
            </p>
            <p>
              <span className="text-paper font-bold">
                Already running three or more days a week:
              </span>{" "}
              You may already have a base. The real question is whether your
              mileage is stable. If you've been consistent for four to six weeks
              without injury, you're likely ready to start a plan.
            </p>

            <H2 id="framework">Building your running base: a simple framework</H2>

            <H3>Start with three days a week</H3>
            <p>
              Three days is the sweet spot. It's enough frequency to drive
              adaptation without overwhelming your recovery. Space the days
              out — something like Monday, Wednesday, Saturday works well for
              most schedules.
            </p>
            <p>
              Don't worry about pace. If you can hold a conversation while
              running, you're in the right zone. If you're gasping, slow down.
              Walk breaks aren't failure. They're a tool.
            </p>

            <H3>Keep your runs short at first</H3>
            <p>
              Start with 20 to 30 minutes per run. The goal in the first two
              weeks is simply to establish the habit and let your body begin
              adapting. Resist the urge to go longer just because you feel good.
            </p>

            <H3>Add mileage slowly</H3>
            <p>
              The standard guideline: increase your total weekly mileage by no
              more than 10 percent per week. If you ran 9 miles last week, aim
              for no more than 10 this week.
            </p>
            <p>
              It feels painfully slow when you're motivated. It works. Runners
              who ignore this rule are the ones nursing shin splints two weeks
              before their race.
            </p>

            <H3>Add a fourth day after four to six weeks</H3>
            <p>
              Once three days a week feels routine and your body isn't
              complaining, add a fourth day. Keep it easy and short. You're
              adding frequency, not intensity.
            </p>

            <H3>One long run per week</H3>
            <p>
              As your base builds, designate one run per week as your long run.
              It should be slower than your other runs and longer by 20 to 30
              percent. This is the run that trains your body to stay on its
              feet — which is exactly what race day demands.
            </p>

            <H2 id="easy">What "easy" actually feels like</H2>
            <p>
              Easy pace is the most misunderstood concept in running. Most
              people run their easy days too fast, which means they can't
              recover properly before the next run.
            </p>
            <p>
              Easy means you could hold a full conversation — complete
              sentences, no pausing to breathe. If you're running with someone
              and responding in short bursts, you're probably a little too fast.
            </p>
            <p className="border-l-2 border-blue pl-5 italic text-paper/90">
              On a 1-to-10 effort scale, easy runs should feel like a 4 or 5.
              You're moving, you're working, but you're not pushing.
            </p>

            <H2 id="mistakes">Common mistakes to avoid</H2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="text-paper font-bold">Running too fast every day.</span>{" "}
                Treating every run like a hard run is a fast path to burnout and
                injury. Easy days need to be genuinely easy.
              </li>
              <li>
                <span className="text-paper font-bold">Skipping rest days.</span>{" "}
                Rest is when your body actually adapts. Taking two days off
                after a long run isn't laziness — it's part of the training.
              </li>
              <li>
                <span className="text-paper font-bold">Jumping into a race plan too soon.</span>{" "}
                A 5K plan that opens with four days of running will break you if
                you haven't built up to it. Be honest about where you are.
              </li>
              <li>
                <span className="text-paper font-bold">Ignoring pain signals.</span>{" "}
                Muscle fatigue is normal. Sharp pain in a joint or bone is not.
                If something hurts in a way that changes your gait, rest it.
              </li>
            </ul>

            <H2 id="ready">When you're ready to start training for a race</H2>
            <p>You're ready to begin a race-specific plan when:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You can run three to four days a week without significant
                soreness carrying over
              </li>
              <li>Your easy runs feel genuinely easy, not like a grind</li>
              <li>
                You've been consistent for at least four weeks without skipping
                more than one run
              </li>
              <li>Your long run is at least 3 to 4 miles without stopping</li>
            </ul>
            <p>
              At that point, a structured plan adds purpose and progression to
              what you've already built. The base is the foundation. The plan is
              what goes on top of it. If you're picking a first target,{" "}
              <Link
                to="/resources/eqt-pittsburgh-10-miler-2026"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                the EQT Pittsburgh 10 Miler guide
              </Link>{" "}
              walks through what a real race build looks like.
            </p>

            <H2 id="group">Running with others makes the base phase easier</H2>
            <p>
              One of the hardest parts of base building is staying consistent
              when there's no race on the calendar yet. No bib number, no
              countdown, no event-day energy. Just you and the miles.
            </p>
            <p>
              This is exactly where a running group changes the equation.
              Knowing that people are meeting Saturday morning at 7 AM is a
              different kind of motivation than an alarm clock.
            </p>
            <p>
              GRYT Run Club meets Saturday mornings at 7 AM in Pittsburgh's
              South Hills — the Montour / Peters Trail in McMurray, roughly 4
              miles. There's no pace requirement, no membership fee, and no one
              gets left behind. If you're in the base-building phase, that's
              exactly the right environment. Easy miles with a group go by
              faster and feel more purposeful.
            </p>
            <p>
              The club's tagline is "Do Hard Things Together," and base building
              qualifies. It's not glamorous. It's also not optional if you want
              to race well.
            </p>
            <p>
              More on why that works:{" "}
              <Link
                to="/resources/running-with-a-group"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                Running With a Group
              </Link>
              .
            </p>

            <H2 id="faqs">Frequently asked questions</H2>
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
              Base building is unglamorous work. No finish line, no medal, no
              one cheering at the end. But it's the reason some runners make it
              to race day feeling strong while others spend the final two weeks
              nursing an injury they could have avoided. Put in the weeks before
              the plan starts, and the plan actually works. That's the whole
              idea.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="run" className="btn-primary">
              See Saturday's run →
            </Link>
            <Link
              to="/resources"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
            >
              Back to Resources
            </Link>
          </div>
        </div>
        <ShareButtons url={URL} title={TITLE} />
      </article>
      <SiteFooter />
    </main>
  );
}
