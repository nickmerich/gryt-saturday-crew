import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GuideShell, GH2, GH3, guideLink, type Source } from "@/components/site/GuideShell";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/pace-calculator`;
const TITLE = "Pace, Effort & Race Time Calculator for Runners · gryt";
const DESCRIPTION =
  "Free running pace calculator: convert time and distance to pace per mile and per kilometer, predict 5K, 10K, 10 mile, half, and marathon times, and learn the talk test for easy effort.";
const UPDATED = "2026-10-20";

const MI_PER_KM = 0.621371;

const PRESETS: Array<{ id: string; label: string; miles: number }> = [
  { id: "1mi", label: "1 mile", miles: 1 },
  { id: "5k", label: "5K", miles: 5 * MI_PER_KM },
  { id: "4mi", label: "4 mi (Saturday)", miles: 4 },
  { id: "10k", label: "10K", miles: 10 * MI_PER_KM },
  { id: "10mi", label: "10 mile", miles: 10 },
  { id: "half", label: "Half", miles: 13.1094 },
  { id: "full", label: "Marathon", miles: 26.2188 },
];

const PREDICT = PRESETS.filter((p) => ["5k", "10k", "10mi", "half", "full"].includes(p.id));

const SOURCES: Source[] = [
  {
    label: "CDC: How to Measure Physical Activity Intensity",
    href: "https://www.cdc.gov/physical-activity-basics/measuring/index.html",
    note: "talk test and 0 to 10 effort scale",
  },
  {
    label: "Peter Riegel, race time prediction formula",
    href: "https://en.wikipedia.org/wiki/Peter_Riegel",
    note: "T2 = T1 × (D2 / D1)^1.06",
  },
  {
    label: "CDC: Getting Started With Physical Activity",
    href: "https://www.cdc.gov/healthy-weight-growth/physical-activity/getting-started.html",
    note: "150 minutes of moderate activity a week",
  },
];

const FAQS = [
  {
    q: "What pace is a GRYT Saturday run?",
    a: "Whatever pace you can hold a conversation at. GRYT is no-drop, so walkers, joggers, and marathoners share the same out-and-back on the Montour / Peters Trail and regroup at the end. There is no pace requirement.",
  },
  {
    q: "How accurate are race time predictions?",
    a: "They are a starting point. Riegel's formula assumes you have trained for the longer distance and that the courses are similar. Predictions from a 5K to a marathon are the least reliable, and hilly Pittsburgh courses usually run slower than flat ones.",
  },
  {
    q: "What is easy pace?",
    a: "Easy pace is effort, not a number. If you can talk in full sentences but could not sing, you are in the moderate zone the CDC describes. Most of your weekly running should feel like that.",
  },
];

export const Route = createFileRoute("/resources_/pace-calculator")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: `${SITE}/og-resources.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "GRYT Pace, Effort & Race Time Calculator",
          url: URL,
          applicationCategory: "HealthApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "gryt run club", url: SITE },
          dateModified: UPDATED,
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
  component: PaceCalculatorPage,
});

function fmtClock(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec <= 0) return "–";
  const s = Math.round(totalSec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

function NumField({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] tracking-[0.2em] uppercase text-paper/60 font-mono">{label}</span>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
          if (max !== undefined && Number(v) > max) return;
          onChange(v);
        }}
        className="w-full bg-ink border border-paper/30 px-3 py-3 text-[22px] font-bold tabular-nums focus:outline-none focus:border-blue"
        aria-label={label}
      />
    </label>
  );
}

function PaceCalculatorPage() {
  const [preset, setPreset] = useState("5k");
  const [custom, setCustom] = useState("3.1");
  const [unit, setUnit] = useState<"mi" | "km">("mi");
  const [h, setH] = useState("0");
  const [m, setM] = useState("30");
  const [s, setS] = useState("0");

  const miles = useMemo(() => {
    if (preset !== "custom") return PRESETS.find((p) => p.id === preset)!.miles;
    const n = parseFloat(custom);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return unit === "mi" ? n : n * MI_PER_KM;
  }, [preset, custom, unit]);

  const seconds = Number(h || 0) * 3600 + Number(m || 0) * 60 + Number(s || 0);
  const valid = miles > 0 && seconds > 0;
  const perMile = valid ? seconds / miles : NaN;
  const perKm = valid ? seconds / (miles / MI_PER_KM) : NaN;
  const mph = valid ? miles / (seconds / 3600) : NaN;

  return (
    <GuideShell
      eyebrow="TOOL · TRAINING"
      title="Pace, Effort & Race Time Calculator"
      dek="Plug in any run. Get your pace per mile and per kilometer, a realistic look at your race times, and a simple way to tell if your easy days are actually easy."
      url={URL}
      updated={UPDATED}
      sources={SOURCES}
      related={["build-a-base", "race-calendar", "run-plan"]}
    >
      <section
        aria-label="Pace calculator"
        className="border border-paper/20 bg-vintage p-5 md:p-8 not-prose"
      >
        <p className="eyebrow text-blue mb-4">1 · Distance</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Distance">
          {[...PRESETS, { id: "custom", label: "Custom", miles: 0 }].map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={preset === p.id}
              onClick={() => setPreset(p.id)}
              className={`px-3.5 py-2 text-[13px] border transition-colors ${
                preset === p.id
                  ? "bg-blue text-ink border-blue font-bold"
                  : "border-paper/30 text-paper/85 hover:border-blue"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="mt-4 flex items-end gap-3 max-w-[340px]">
            <label className="flex-1 flex flex-col gap-1.5">
              <span className="text-[11px] tracking-[0.2em] uppercase text-paper/60 font-mono">Distance</span>
              <input
                inputMode="decimal"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, "").slice(0, 6))}
                className="w-full bg-ink border border-paper/30 px-3 py-3 text-[22px] font-bold tabular-nums focus:outline-none focus:border-blue"
              />
            </label>
            <div className="flex border border-paper/30" role="radiogroup" aria-label="Unit">
              {(["mi", "km"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  aria-checked={unit === u}
                  onClick={() => setUnit(u)}
                  className={`px-4 py-3.5 text-[14px] ${unit === u ? "bg-blue text-ink font-bold" : "text-paper/80"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="eyebrow text-blue mt-8 mb-4">2 · Your time</p>
        <div className="grid grid-cols-3 gap-3 max-w-[420px]">
          <NumField label="Hours" value={h} onChange={setH} max={99} />
          <NumField label="Minutes" value={m} onChange={setM} max={59} />
          <NumField label="Seconds" value={s} onChange={setS} max={59} />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-paper/20 border border-paper/20" aria-live="polite">
          <Stat label="Pace per mile" value={valid ? `${fmtClock(perMile)}` : "–"} />
          <Stat label="Pace per km" value={valid ? `${fmtClock(perKm)}` : "–"} />
          <Stat label="Speed" value={valid ? `${mph.toFixed(1)} mph` : "–"} />
        </div>

        <p className="eyebrow text-blue mt-8 mb-3">3 · Predicted race times</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px] tabular-nums">
            <thead>
              <tr className="text-[11px] tracking-[0.2em] uppercase text-paper/55 font-mono">
                <th className="py-2 pr-4 font-normal">Race</th>
                <th className="py-2 pr-4 font-normal">Finish</th>
                <th className="py-2 font-normal">Pace / mi</th>
              </tr>
            </thead>
            <tbody>
              {PREDICT.map((p) => {
                const t = valid ? seconds * Math.pow(p.miles / miles, 1.06) : NaN;
                return (
                  <tr key={p.id} className="border-t border-paper/15">
                    <td className="py-2.5 pr-4 font-bold">{p.label}</td>
                    <td className="py-2.5 pr-4">{fmtClock(t)}</td>
                    <td className="py-2.5">{fmtClock(t / p.miles)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[13.5px] text-paper/60 leading-[1.6]">
          Predictions use Riegel's formula and assume you have trained for the longer distance.
          Expect hilly courses like the EQT Pittsburgh 10 Miler to run a little slower.
        </p>
      </section>

      <GH2 id="effort">Easy is an effort, not a number</GH2>
      <p>
        The most common mistake we see on Saturdays is not running too slow. It is running every
        run too fast. Pace changes with hills, heat, sleep, and stress. Effort does not lie, which
        is why the talk test works better than a watch for most runs.
      </p>
      <div className="mt-6 grid gap-px bg-paper/15 border border-paper/15 sm:grid-cols-3">
        <EffortCard
          zone="Easy"
          scale="Up to 6 of 10"
          test="You can talk in full sentences. Singing would be a stretch."
          when="Most of your week, and every GRYT Saturday."
        />
        <EffortCard
          zone="Steady"
          scale="Effort 6 to 7 of 10"
          test="Short sentences only. You'd rather listen than talk."
          when="Tempo efforts, the last mile of a long run."
        />
        <EffortCard
          zone="Hard"
          scale="Effort 7 to 9 of 10"
          test="A few words at a time before you need a breath."
          when="Hill repeats, race day, once a week at most."
        />
      </div>
      <p className="mt-5">
        The CDC uses the same idea: during moderate activity you{" "}
        <a
          className={guideLink}
          href="https://www.cdc.gov/physical-activity-basics/measuring/index.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          can talk, but not sing
        </a>
        , and during vigorous activity you cannot say more than a few words without pausing for a
        breath. On their 0 to 10 scale, moderate effort is a 5 or 6 and vigorous starts at 7 or 8.
      </p>

      <GH2 id="use">How to use your numbers</GH2>
      <GH3>Pick a goal race, then work backward</GH3>
      <p>
        Run a recent 5K or a hard 2 miles, enter it above, and look at the prediction for your goal
        distance. If the gap between today and your goal is big, give yourself more weeks, not
        faster workouts. Our{" "}
        <a className={guideLink} href="/races">
          Pittsburgh race calendar
        </a>{" "}
        shows how many weeks you have left for each local race.
      </p>
      <GH3>Recheck every four to six weeks</GH3>
      <p>
        Fitness shows up slowly. Retest on the same route in similar weather so you are comparing
        like with like. The mostly flat, crushed-limestone stretch of the Montour Trail out of Peterswood
        Park is a good test strip.
      </p>
      <GH3>Do not chase a number on hills</GH3>
      <p>
        South Hills running means climbing. Let pace drop on the uphills, hold the same effort, and
        let gravity give it back on the way down.
      </p>

      <GH2 id="faqs">Frequently asked questions</GH2>
      <div className="space-y-6">
        {FAQS.map((f) => (
          <div key={f.q}>
            <p className="font-bold text-paper">{f.q}</p>
            <p className="mt-1.5">{f.a}</p>
          </div>
        ))}
      </div>
    </GuideShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink p-4 md:p-5">
      <p className="text-[11px] tracking-[0.2em] uppercase text-paper/55 font-mono">{label}</p>
      <p className="mt-1.5 text-[30px] md:text-[34px] font-bold tabular-nums leading-none">{value}</p>
    </div>
  );
}

function EffortCard({ zone, scale, test, when }: { zone: string; scale: string; test: string; when: string }) {
  return (
    <div className="bg-ink p-5">
      <p className="text-[20px] font-bold">{zone}</p>
      <p className="text-[11px] tracking-[0.2em] uppercase text-blue font-mono mt-1">{scale}</p>
      <p className="mt-3 text-[15px] text-paper/85 leading-[1.55]">{test}</p>
      <p className="mt-2 text-[13.5px] text-paper/60 leading-[1.5]">{when}</p>
    </div>
  );
}
