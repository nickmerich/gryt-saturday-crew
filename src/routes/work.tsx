import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { SaturdayInvite } from "@/components/site/GuideShell";
import { SKILLS, SKILL_CATEGORIES, WORKFLOWS, type SkillCategory } from "@/lib/the-work";

const SITE = "https://grytrunclub.com";
const TITLE = "The Work · Free Skills, Workflows & 4-Week Programs | GRYT Run Club";
const DESCRIPTION =
  "Free training skills and step-by-step workflows for parents, former athletes, and grinders. Set a goal, write a four-week program around the Saturday run, test it, and check in with your crew.";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "The Work · GRYT Run Club" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/work` },
      { property: "og:image", content: `${SITE}/og-resources.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/work` }],
  }),
  component: WorkPage,
});

const CATEGORY_LABEL: Record<SkillCategory, string> = {
  run: "Run",
  strength: "Strength",
  durability: "Durability",
  life: "Real life",
};

const STEPS = [
  { n: "01", title: "Pick a goal", body: "One lane, one date, one reason.", slug: "set-your-goal" },
  {
    n: "02",
    title: "Write your program",
    body: "Four weeks built around your real week.",
    slug: "write-your-program",
  },
  {
    n: "03",
    title: "Do the work",
    body: "Weekdays on your own. Saturday with the crew.",
    slug: "write-your-program",
  },
  {
    n: "04",
    title: "Check in Sunday",
    body: "Five minutes. One change for next week.",
    slug: "weekly-check-in",
  },
  {
    n: "05",
    title: "Retest in week 4",
    body: "Same four tests. See what moved.",
    slug: "benchmark-day",
  },
] as const;

const FOR = [
  {
    who: "Parents",
    line: "You've got 20 minutes before the house wakes up. Every program here has a real 20-minute version, and Saturday plus one session counts as a training week.",
  },
  {
    who: "Former athletes",
    line: "You remember having a program. Here's one again, with a comeback path that respects the tendons you have now, not the ones you had at 20.",
  },
  {
    who: "Grinders",
    line: "You just want to get better. Pick a lane, follow the build, retest, and keep stacking blocks.",
  },
];

function WorkPage() {
  const [cat, setCat] = useState<SkillCategory | "all">("all");
  const shown = cat === "all" ? SKILLS : SKILLS.filter((s) => s.category === cat);

  return (
    <main className="bg-ink text-paper">
      <SiteNav />

      <section className="px-6 sm:px-12 lg:px-24 pt-14 md:pt-20 pb-14 border-b border-paper/15">
        <div className="max-w-[1100px] mx-auto">
          <p className="eyebrow text-blue mb-5">The Work · Skills & workflows</p>
          <h1 className="display-condensed uppercase text-[clamp(44px,8vw,104px)] leading-[0.92]">
            Write the plan.
            <br />
            Do the work.
            <br />
            Together.
          </h1>
          <p className="mt-7 max-w-[680px] text-paper/80 text-lg md:text-xl leading-[1.55]">
            Free tools to set a goal, write a four-week program around the Saturday run, test where
            you're at, and check in with people chasing something too. Optional, like everything
            else here. The Saturday run is still free and still for every pace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/work/workflows/$slug"
              params={{ slug: "write-your-program" }}
              hash="builder"
              className="btn-primary"
            >
              Write your program →
            </Link>
            <Link
              to="/work/workflows/$slug"
              params={{ slug: "set-your-goal" }}
              className="btn-ghost"
            >
              Start with a goal
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="for"
        className="px-6 sm:px-12 lg:px-24 py-14 border-b border-paper/15"
      >
        <div className="max-w-[1100px] mx-auto">
          <h2 id="for" className="eyebrow text-paper/60 mb-6">
            Who it's for
          </h2>
          <ul className="grid gap-px bg-paper/15 border border-paper/15 md:grid-cols-3">
            {FOR.map((f) => (
              <li key={f.who} className="bg-ink p-6">
                <p className="display-condensed uppercase text-[30px] text-blue">{f.who}</p>
                <p className="mt-3 text-paper/80 text-[16px] leading-[1.6]">{f.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="how"
        className="px-6 sm:px-12 lg:px-24 py-14 border-b border-paper/15"
      >
        <div className="max-w-[1100px] mx-auto">
          <h2 id="how" className="display-condensed uppercase text-[clamp(32px,5vw,56px)]">
            How it works
          </h2>
          <ol className="mt-8 grid pl-px pt-px sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-ink border border-paper/15 -ml-px -mt-px">
                <Link
                  to="/work/workflows/$slug"
                  params={{ slug: s.slug }}
                  className="group block h-full p-5 hover:bg-blue hover:text-ink transition-colors"
                >
                  <span className="font-mono text-[12px] tracking-[0.2em] text-blue group-hover:text-ink">
                    {s.n}
                  </span>
                  <span className="mt-2 block font-bold text-[18px]">{s.title}</span>
                  <span className="mt-1 block text-[14.5px] text-paper/70 group-hover:text-ink">
                    {s.body}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="workflows"
        aria-labelledby="wf"
        className="px-6 sm:px-12 lg:px-24 py-14 border-b border-paper/15 scroll-mt-24"
      >
        <div className="max-w-[1100px] mx-auto">
          <h2 id="wf" className="display-condensed uppercase text-[clamp(32px,5vw,56px)]">
            Workflows
          </h2>
          <p className="mt-3 max-w-[640px] text-paper/75">
            Step-by-step processes. Each one ends with something you keep.
          </p>
          <ul className="mt-8 grid gap-px bg-paper/15 border border-paper/15 md:grid-cols-2 lg:grid-cols-3">
            {WORKFLOWS.map((w) => (
              <li key={w.slug} className="bg-ink">
                <Link
                  to="/work/workflows/$slug"
                  params={{ slug: w.slug }}
                  className="group block h-full p-6 hover:bg-blue hover:text-ink transition-colors"
                >
                  <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-blue group-hover:text-ink">
                    {w.time}
                    {w.tool ? " · has a tool" : ""}
                  </span>
                  <span className="mt-2 block text-[20px] font-bold">{w.name}</span>
                  <span className="mt-2 block text-[15px] text-paper/75 group-hover:text-ink">
                    {w.oneLiner}
                  </span>
                  <span className="mt-4 block text-[13.5px] text-paper/60 group-hover:text-ink">
                    You get: {w.output}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="skills"
        aria-labelledby="sk"
        className="px-6 sm:px-12 lg:px-24 py-14 border-b border-paper/15 scroll-mt-24"
      >
        <div className="max-w-[1100px] mx-auto">
          <h2 id="sk" className="display-condensed uppercase text-[clamp(32px,5vw,56px)]">
            Skills
          </h2>
          <p className="mt-3 max-w-[640px] text-paper/75">
            The building blocks. Every skill has three levels: Start, Build, Own. When in doubt,
            start lower.
          </p>
          <div role="group" aria-label="Filter skills" className="mt-6 flex flex-wrap gap-2">
            {SKILL_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`min-h-[44px] px-4 border text-[14px] font-bold uppercase tracking-[0.08em] transition-colors ${
                  cat === c.id
                    ? "bg-blue text-ink border-blue"
                    : "border-paper/30 text-paper hover:border-blue"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <ul className="mt-6 grid pl-px pt-px sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s) => (
              <li key={s.slug} className="bg-ink border border-paper/15 -ml-px -mt-px">
                <Link
                  to="/work/skills/$slug"
                  params={{ slug: s.slug }}
                  className="group block h-full p-5 hover:bg-blue hover:text-ink transition-colors"
                >
                  <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-blue group-hover:text-ink">
                    {CATEGORY_LABEL[s.category]} · {s.minutes}
                  </span>
                  <span className="mt-2 block text-[18px] font-bold">{s.name}</span>
                  <span className="mt-1.5 block text-[14.5px] text-paper/75 group-hover:text-ink">
                    {s.oneLiner}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="rules" className="px-6 sm:px-12 lg:px-24 py-14">
        <div className="max-w-[820px] mx-auto">
          <h2 id="rules" className="display-condensed uppercase text-[clamp(32px,5vw,56px)]">
            Ground rules
          </h2>
          <ul className="mt-6 space-y-4 text-[16.5px] leading-[1.6] text-paper/85">
            <li>
              <strong className="text-paper">Hard, not harsh.</strong> Soreness is normal. Sharp
              pain, limping, or pain that changes how you move means stop and get it looked at.
            </li>
            <li>
              <strong className="text-paper">Know your floor.</strong> The minimum week you'll hit
              even when life gets loud. For most of us, Saturday plus one 20-minute session.
            </li>
            <li>
              <strong className="text-paper">Don't make up missed workouts.</strong> Repeat your
              last good week instead.
            </li>
            <li>
              <strong className="text-paper">Three weeks build, one week lighter.</strong> Then
              retest.
            </li>
            <li>
              <strong className="text-paper">Your numbers are yours.</strong> The tools save on your
              device only.
            </li>
          </ul>
          <p className="mt-6 text-[13.5px] text-paper/55 leading-[1.6]">
            General guidance, not medical advice. If you have a heart, lung, or other health
            condition, or you're pregnant or coming back from injury, check with your doctor before
            changing how you train.
          </p>
          <SaturdayInvite />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
