import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import heroAsset from "@/assets/cross-training-runners.png.asset.json";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/cross-training-for-runners`;
const HERO = `${SITE}${heroAsset.url}`;
const TITLE = "Cross-Training for Runners: Best Low-Impact Options · gryt";
const DESCRIPTION =
  "The best low-impact cross-training for runners — cycling, swimming, elliptical, strength, yoga, hiking, rowing — and how to fit it into a real running week.";
const PUBLISHED = "2026-08-31";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "why", label: "Why cross-training matters more than most runners think" },
  { id: "options", label: "The best low-impact cross-training options" },
  { id: "structure", label: "How to structure cross-training in a running week" },
  { id: "comeback", label: "Cross-training for comeback runners" },
  { id: "wont-fix", label: "What cross-training won't fix" },
  { id: "consistency", label: "The consistency argument" },
  { id: "faqs", label: "Frequently asked questions" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What is the best cross-training for runners who want to stay aerobically fit?",
    a: "Cycling and swimming are the most effective options for maintaining cardiovascular fitness between run days. Both deliver a strong aerobic stimulus without the impact load of running. Cycling is more accessible for most people; swimming is the better choice when lower-body impact needs to be eliminated entirely.",
  },
  {
    q: "How many days per week should runners cross-train?",
    a: "For most recreational runners doing two to four runs per week, one to two cross-training sessions per week is enough. One session focused on cardiovascular work (cycling, swimming, elliptical) and one on strength training. More than that can interfere with recovery if intensity isn't managed carefully.",
  },
  {
    q: "Can cross-training replace running entirely for a week?",
    a: "Yes, for short periods. If you're dealing with minor soreness, fatigue, or a low-grade injury, replacing one or two runs with cycling or swimming for a week is a reasonable approach. You won't lose meaningful fitness in seven days, and the extra recovery time often pays off in the weeks that follow.",
  },
  {
    q: "Is strength training considered cross-training for runners?",
    a: "It depends on how you define it. Strength training doesn't replicate the cardiovascular demand of running, so it's not a direct substitute for a run. But it's one of the most important things a runner can do to stay healthy and run more efficiently. Think of it as a separate category: structural work rather than cardiovascular cross-training.",
  },
  {
    q: "What cross-training is best for comeback runners returning after a long break?",
    a: "The elliptical and cycling are the best starting points. Both let you build aerobic fitness without the impact load that running places on joints and connective tissue. That matters because cardiovascular fitness returns faster than tissue tolerance — cross-training lets you bridge that gap without getting hurt.",
  },
  {
    q: "How does cross-training help with race preparation?",
    a: "It adds aerobic volume without adding impact miles, which reduces injury risk during peak training. For a race like the Pittsburgh Great Race on September 26–27, 2026, runners who supplement their run days with cycling or strength work tend to arrive at the start line healthier than those who only run.",
  },
  {
    q: "Should I cross-train the day before a race?",
    a: "A very light session — 20 minutes of easy cycling or gentle yoga — is fine the day before a race for most runners. Avoid anything that creates muscular fatigue or soreness. The goal is to stay loose and keep blood moving, not to add a training stimulus.",
  },
];

export const Route = createFileRoute("/resources_/cross-training-for-runners")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "cross-training for runners, low-impact cardio, cycling for runners, swimming for runners, elliptical, strength training for runners, comeback runners, Pittsburgh run club",
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
          headline:
            "Cross-Training for Runners: The Best Low-Impact Options Between Run Days",
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
            { "@type": "ListItem", position: 2, name: "Cross-Training for Runners", item: URL },
          ],
        }),
      },
    ],
  }),
  component: CrossTrainingPage,
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

const WEEK_TWO = [
  ["Saturday", "Run"],
  ["Sunday", "Strength training or yoga"],
  ["Monday", "Rest or light mobility"],
  ["Tuesday", "Run"],
  ["Wednesday", "Cycling or elliptical, 30–45 minutes"],
  ["Thursday", "Strength training"],
  ["Friday", "Rest or light mobility"],
];

const WEEK_THREE = [
  ["Saturday", "Run"],
  ["Sunday", "Strength training"],
  ["Monday", "Cycling or swimming, 30–40 minutes"],
  ["Tuesday", "Run"],
  ["Wednesday", "Rest or yoga"],
  ["Thursday", "Run"],
  ["Friday", "Rest"],
];

function WeekTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="border border-paper/15">
      <p className="eyebrow text-blue px-5 py-3 border-b border-paper/15">{title}</p>
      <ul className="divide-y divide-paper/10">
        {rows.map(([day, work]) => (
          <li key={day} className="flex gap-4 px-5 py-3 text-[15px]">
            <span className="w-[92px] shrink-0 text-paper font-bold uppercase tracking-[0.1em] text-[12px] pt-[3px]">
              {day}
            </span>
            <span className="text-paper/80">{work}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CrossTrainingPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[760px] mx-auto">
          <Link to="/resources" className="eyebrow text-blue hover:text-paper transition-colors">
            ← All resources
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">TRAINING · 9 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,88px)] leading-[0.95]">
            Cross-Training for Runners: The Best Low-Impact Options Between Run Days
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            Movement that keeps your aerobic engine running without hammering
            the same joints running already punishes.
          </p>

          <figure className="mt-10 border border-paper/15">
            <img
              src={heroAsset.url}
              alt="Composite of a runner, cyclist, swimmer, rower, and lifter training at night with the Pittsburgh skyline behind them"
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
              Cross-training for runners sounds optional until it isn't. You're
              four weeks out from a race, your legs feel like wet concrete, and
              you're trying to decide whether another easy run will help or just
              dig the hole deeper. Most of the time, the answer is neither. What
              you actually need is movement that keeps your aerobic engine
              running without adding more stress to the same joints and muscles
              that running already hammers.
            </p>
            <p>
              This guide covers the best low-impact cross-training options for
              recreational runners, when to use them, and how to fit them into a
              week that already has two or three runs in it.
            </p>

            <H2 id="why">Why cross-training matters more than most runners think</H2>
            <p>
              Running is a high-impact, repetitive-stress activity. Every mile
              adds roughly 1,500 foot strikes per leg. Your hips, knees, ankles,
              and lower back absorb that load every single time. For most
              recreational runners, the limiting factor isn't cardiovascular
              fitness. It's tissue tolerance — the ability of tendons,
              cartilage, and connective tissue to handle cumulative stress
              without breaking down.
            </p>
            <p>
              Cross-training fills that gap. It lets you build or maintain
              aerobic fitness on days when your legs need a break from impact,
              and it strengthens muscle groups that running underuses, which
              makes you more resilient when you do run.
            </p>
            <p>
              There's another benefit that's less obvious: cross-training keeps
              the habit alive. When a minor tweak forces you off the roads for a
              week, having a low-impact alternative means you don't lose the
              routine entirely. That matters more than most people admit.
            </p>

            <H2 id="options">The best low-impact cross-training options</H2>

            <H3>Cycling</H3>
            <p>
              Cycling is the closest analog to running in terms of
              cardiovascular demand without the impact. Heart rate, breathing,
              leg turnover — it all feels familiar. The primary muscles overlap
              significantly with running, particularly the quads and glutes,
              though cycling doesn't load the hip flexors or calves the same
              way.
            </p>
            <p>
              Road cycling, a stationary bike, or a spin class all work. The
              main variable is intensity. An easy 45-minute ride at a
              conversational pace is genuine active recovery. A hard 60-minute
              interval session on a stationary bike is a training stimulus. Both
              have their place — just don't confuse them.
            </p>
            <p>
              For runners building toward something like the Pittsburgh Great
              Race on September 26–27, 2026, cycling is a reliable way to add
              aerobic volume on non-run days without stacking more impact miles.
            </p>

            <H3>Swimming</H3>
            <p>
              Swimming is the gold standard for zero-impact aerobic work. No
              ground reaction force at all. For runners dealing with knee pain,
              shin splints, or any lower-leg irritation, the pool is often the
              only option that doesn't make things worse.
            </p>
            <p>
              The catch is the learning curve. If you're not a confident
              swimmer, your technique limits your effort before your lungs do,
              and the cardiovascular benefit drops. Thirty minutes of focused
              lap swimming at a moderate pace is a solid session. If technique
              is a barrier, water running — jogging in the deep end with a
              flotation belt — delivers similar benefits without requiring any
              swimming skill.
            </p>

            <H3>Elliptical</H3>
            <p>
              The elliptical is underrated. The movement pattern is close enough
              to running that your neuromuscular system gets some of the same
              stimulus, but the impact is minimal. It's especially useful for
              comeback runners rebuilding mileage after a gap, because it lets
              you extend the duration of aerobic work beyond what your joints
              can currently handle on pavement.
            </p>
            <p>
              One thing to watch: it's easy to do passively. Leaning on the
              handles, keeping resistance low, coasting through 30 minutes —
              that doesn't accomplish much. Keep your hands off the rails, drive
              through your hips, and use enough resistance that you're actually
              working.
            </p>

            <H3>Strength training</H3>
            <p>
              This one deserves its own category because it's not cardiovascular
              cross-training. It's structural. Runners who do consistent
              strength work get injured less often, recover faster, and run more
              efficiently. The research on this isn't ambiguous.
            </p>
            <p>
              The areas that matter most: single-leg stability (Bulgarian split
              squats, single-leg deadlifts), hip abductor strength (lateral band
              walks, clamshells), and calf and Achilles loading (heel drops,
              calf raises on a step). Not glamorous exercises. Just the ones
              that keep you running when other people are sitting out.
            </p>
            <p>
              Two sessions per week, 30 to 40 minutes each, is enough to see
              real benefit without interfering with your running. The biggest
              mistake runners make is treating strength work as optional when
              training is going well, then scrambling to add it when something
              hurts.
            </p>

            <H3>Yoga and mobility work</H3>
            <p>
              Yoga isn't a substitute for strength training or cardiovascular
              cross-training. But it's a legitimate tool for managing the
              tightness and range-of-motion restrictions that accumulate with
              regular running.
            </p>
            <p>
              Hip flexors, hamstrings, thoracic spine, ankles — these are the
              areas most runners neglect. A 20-to-30-minute yoga session focused
              on those spots, done consistently two or three times per week,
              makes a noticeable difference in how you feel on runs. It also
              tends to improve sleep quality, which matters more for recovery
              than most people realize.
            </p>
            <p>
              If a full practice feels like too much, do 10 minutes of targeted
              mobility work before bed. It compounds.
            </p>

            <H3>Hiking</H3>
            <p>
              Hiking doesn't get enough credit. It's low-impact, it loads the
              legs in a way that builds hip and glute strength, and the
              elevation changes create cardiovascular demand without the
              repetitive impact of running. For runners who live near trails, a
              60-to-90-minute hike on a recovery day is genuinely useful — not
              just a nice walk.
            </p>
            <p>
              The Montour/Peters Trail in McMurray, where GRYT Run Club meets
              every Saturday at 7 AM, connects to enough surrounding terrain
              that a mid-week hike in the same area is a natural option for
              South Hills runners who want to stay active without adding road
              miles.
            </p>

            <H3>Rowing</H3>
            <p>
              Rowing taxes the cardiovascular system without loading the lower
              body the way running does. It's particularly good for runners who
              have upper-body weakness, because running doesn't develop it. A
              20-minute session at moderate intensity is a legitimate aerobic
              workout. A 30-minute interval session is hard.
            </p>
            <p>
              The technique barrier is real. Rowing with poor form puts stress
              on the lower back. If you're new to it, spend a session or two
              learning the drive sequence before you push the intensity.
            </p>

            <H2 id="structure">How to structure cross-training in a running week</H2>
            <p>
              The most common mistake is treating cross-training as something
              you do when you can't run, rather than something you plan. Here's
              a simple structure that works for runners doing two or three runs
              per week.
            </p>
            <div className="grid gap-4 md:grid-cols-2 not-prose">
              <WeekTable
                title="Two-run week (Saturday with GRYT + one midweek run)"
                rows={WEEK_TWO}
              />
              <WeekTable title="Three-run week" rows={WEEK_THREE} />
            </div>
            <p>
              The principle is simple: alternate impact days with non-impact
              days. Don't stack two hard sessions back-to-back. And don't skip
              the strength work because you feel good — that's exactly when it's
              most tempting to skip it, and exactly when it matters most.
            </p>

            <H2 id="comeback">Cross-training for comeback runners</H2>
            <p>
              If you're returning to running after a gap — six months or six
              years — cross-training isn't supplementary. It's the foundation.
            </p>
            <p>
              Your cardiovascular system deconditions faster than your
              connective tissue. That means you'll feel aerobically ready to run
              more before your tendons and cartilage can actually handle it.
              Cross-training lets you build the aerobic base while your tissue
              tolerance catches up.
            </p>
            <p>
              The practical approach: for every run you add, match it with a
              cross-training session of similar duration. If you run 30 minutes
              on Saturday, do 30 minutes on the bike on Wednesday. Gradually
              shift the balance toward running as your body adapts.
            </p>
            <p>
              This is part of why the no-drop policy at GRYT matters for
              comeback runners. You're not getting dropped because you're slower
              than you used to be. You finish with the crew. That consistency —
              showing up every week without the pressure of keeping pace — is
              what rebuilds the habit. And the habit is what makes the
              cross-training stick too.
            </p>
            <p>
              If you're curious about what a low-pressure, no-pace-requirement
              running group actually looks like,{" "}
              <Link
                to="/resources/more-than-miles"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                this piece on what happens after the run
              </Link>{" "}
              gives you a better picture than any description of the format can.
            </p>

            <H2 id="wont-fix">What cross-training won't fix</H2>
            <p>
              Cross-training is not a substitute for rest when rest is what your
              body needs. If you're dealing with a stress fracture, a
              significant tendon injury, or persistent pain that changes your
              gait, the answer isn't to find a lower-impact version of the same
              movement. See someone who can actually assess what's happening.
            </p>
            <p>
              Cross-training also won't compensate for chronic underrecovery. If
              you're sleeping five hours a night, eating poorly, and running on
              stress, adding cycling sessions won't make you more resilient. It
              just adds another demand to a system that's already depleted.
            </p>
            <p>
              Use cross-training to fill the gaps between runs — not to avoid
              the rest your body is asking for.
            </p>

            <H2 id="consistency">The consistency argument</H2>
            <p>The best cross-training option is the one you'll actually do.</p>
            <p>
              Swimming is theoretically excellent. If you hate the pool and skip
              it every week, it's worthless. The elliptical isn't as stimulating
              as a trail run. If you'll actually get on it for 40 minutes on a
              Wednesday, it beats the swim you never take.
            </p>
            <p>
              Pick two or three options from this list that fit your schedule,
              your access, and your honest preferences. Do them consistently.
              Consistency compounds — and that's as true for mobility work and
              mid-week bike rides as it is for the Saturday morning ritual of
              showing up at the trailhead regardless of the weather.
            </p>
            <p>
              If you're still figuring out what a consistent running week looks
              like, or you want to run with people who aren't going to drop you
              for being slower than you were five years ago, GRYT Run Club meets
              every Saturday at 7 AM on the Montour/Peters Trail in McMurray. No
              fees. No pace requirement. Just show up.
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
              The work between runs is where a lot of races are actually
              decided. Not dramatically. Just in the quiet accumulation of
              sessions that kept you healthy, kept your aerobic base intact, and
              kept you showing up. That is the work now.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              See Saturday's run →
            </Link>
            <Link
              to="/resources"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
            >
              Back to Resources
            </Link>
          </div>

          <ShareButtons url={URL} title={TITLE} />
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
