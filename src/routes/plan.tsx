import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { createRunPlan, type RunPlan, type PlanInputType } from "@/lib/training-plan.functions";

const TITLE = "Build Your Run Plan · Free AI Training Plan | GRYT Run Club";
const DESCRIPTION =
  "Build your run plan free: share your goal, schedule, and starting point. Get a one-week plan built around GRYT's Saturday 7 AM run in McMurray, PA.";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["SportsOrganization", "LocalBusiness"],
  name: "GRYT Run Club",
  url: "https://grytrunclub.com",
  logo: "https://grytrunclub.com/images/gryt-logo.png",
  description:
    "GRYT Run Club offers free AI-powered running training plans built around community Saturday runs in McMurray, PA.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "McMurray",
    addressRegion: "PA",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.instagram.com/grytrunclub",
    "https://www.facebook.com/grytrunclub",
    "https://www.strava.com/clubs/grytrunclub",
  ],
  foundingDate: "2026",
  sport: "Running",
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the AI run plan free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, GRYT Run Club's AI training plan is completely free.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize my training schedule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can input your goal, available days, and current fitness level to get a personalized plan.",
      },
    },
  ],
};

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grytrunclub.com/plan" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/plan" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORGANIZATION_SCHEMA),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(FAQ_SCHEMA),
      },
    ],
  }),
  component: PlanPage,
});

const EXPERIENCE: { value: PlanInputType["experience"]; label: string }[] = [
  { value: "new", label: "New to running" },
  { value: "returning", label: "Coming back" },
  { value: "regular", label: "Running regularly" },
  { value: "competitive", label: "Chasing a PR" },
];

const body = { fontFamily: "var(--font-body)" } as const;
const condensed = { fontFamily: "var(--font-display-condensed)" } as const;

function PlanPage() {
  const run = useServerFn(createRunPlan);
  const [form, setForm] = useState<PlanInputType>({
    goal: "",
    raceDate: "",
    experience: "regular",
    daysPerWeek: 4,
    currentMileage: "",
    constraints: "",
  });
  const [plan, setPlan] = useState<RunPlan | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string>("");

  const set = <K extends keyof PlanInputType>(k: K, v: PlanInputType[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.goal.trim().length < 3) {
      setStatus("error");
      setError("Tell us the goal first — even one line.");
      return;
    }
    setStatus("loading");
    setError("");
    setPlan(null);
    try {
      const result = await run({ data: form });
      setPlan(result as RunPlan);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something broke on our end. Try again in a minute.",
      );
    }
  }

  const inputClass =
    "w-full border border-ink/20 bg-white px-4 py-3 text-ink outline-none focus:border-ink";

  return (
    <>
      <SiteNav />
      <main id="main-content">
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <div className="eyebrow text-ink/60 mb-4" style={body}>
            BUILD YOUR WEEK
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.92] tracking-tight"
            style={condensed}
          >
            Build your run.
            <br />
            Our Saturday.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/80" style={body}>
            Tell us the goal, the days you actually have, and where you're
            starting. You'll get a one-week plan built around the 7 AM
            Saturday run at Valley Brook.
          </p>

          <form onSubmit={onSubmit} className="mt-12 grid gap-6" style={body}>
            <label className="grid gap-2">
              <span className="eyebrow text-ink/60">WHAT ARE YOU AFTER?</span>
              <textarea
                className={inputClass}
                rows={3}
                maxLength={400}
                placeholder="Finish the EQT 10 Miler without walking."
                value={form.goal}
                onChange={(e) => set("goal", e.target.value)}
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="eyebrow text-ink/60">RACE DATE OR TIMELINE</span>
                <input
                  className={inputClass}
                  maxLength={40}
                  placeholder="Nov 2026, or 12 weeks"
                  value={form.raceDate}
                  onChange={(e) => set("raceDate", e.target.value)}
                />
              </label>

              <label className="grid gap-2">
                <span className="eyebrow text-ink/60">WHERE YOU'RE AT</span>
                <select
                  className={inputClass}
                  value={form.experience}
                  onChange={(e) =>
                    set("experience", e.target.value as PlanInputType["experience"])
                  }
                >
                  {EXPERIENCE.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="eyebrow text-ink/60">DAYS PER WEEK</span>
                <select
                  className={inputClass}
                  value={form.daysPerWeek}
                  onChange={(e) => set("daysPerWeek", Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="eyebrow text-ink/60">CURRENT WEEKLY MILES</span>
                <input
                  className={inputClass}
                  maxLength={60}
                  placeholder="About 10, mostly easy"
                  value={form.currentMileage}
                  onChange={(e) => set("currentMileage", e.target.value)}
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="eyebrow text-ink/60">
                INJURIES, SCHEDULE, ANYTHING ELSE
              </span>
              <textarea
                className={inputClass}
                rows={3}
                maxLength={500}
                placeholder="Bad left knee. Kids' games most Sundays."
                value={form.constraints}
                onChange={(e) => set("constraints", e.target.value)}
              />
            </label>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-ink px-8 py-4 uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink/85 disabled:opacity-60"
              >
                {status === "loading" ? "Building your plan\u2026" : "Build my plan"}
              </button>
              <span className="text-sm text-ink/60">
                Takes about a minute. Nothing is saved.
              </span>
            </div>
          </form>

          <div aria-live="polite" className="mt-10" style={body}>
            {status === "error" && (
              <p className="border-l-4 border-ink px-4 py-3 text-ink">{error}</p>
            )}

            {status === "loading" && (
              <p className="text-ink/70">
                Coach is working. Hold tight \u2014 this takes a minute.
              </p>
            )}

            {plan && (
              <article className="border-t-2 border-ink pt-8">
                <h2
                  className="text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl"
                  style={condensed}
                >
                  {plan.title}
                </h2>
                <p className="mt-4 text-lg text-ink/80">{plan.summary}</p>
                <p className="mt-4 text-ink/60">
                  <span className="eyebrow">Target volume</span>{" "}
                  <span className="text-sm">{plan.weeklyMileage}</span>
                </p>


                <ol className="mt-10 border-t border-ink/15">
                  {plan.week.map((d, i) => (
                    <li
                      key={i}
                      className="grid gap-1 border-b border-ink/15 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6"
                    >
                      <div className="eyebrow text-ink/60">{d.day}</div>
                      <div>
                        <div className="font-semibold uppercase tracking-wide">
                          {d.focus}
                        </div>
                        <p className="mt-1 text-ink/80">{d.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-10 grid gap-10 sm:grid-cols-2">
                  <div>
                    <h3 className="eyebrow text-ink/60">NEXT FOUR WEEKS</h3>
                    <ul className="mt-3 space-y-2 text-ink/80">
                      {plan.progression.map((p, i) => (
                        <li key={i} className="border-l-2 border-ink/20 pl-3">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="eyebrow text-ink/60">WATCH OUT FOR</h3>
                    <ul className="mt-3 space-y-2 text-ink/80">
                      {plan.watchOuts.map((w, i) => (
                        <li key={i} className="border-l-2 border-ink/20 pl-3">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-10 text-sm text-ink/60">
                  This is a training suggestion, not medical advice. See a
                  doctor before starting something new if anything hurts.
                </p>
              </article>
            )}
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
