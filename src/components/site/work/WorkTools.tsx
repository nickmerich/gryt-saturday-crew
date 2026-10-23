import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import {
  LANES,
  LEVELS,
  buildProgram,
  programAsText,
  readWork,
  skillBySlug,
  writeWork,
  type BenchmarkEntry,
  type CheckIn,
  type DaysPerWeek,
  type Equipment,
  type GoalCard,
  type Lane,
  type Level,
  type Program,
  type ProgramInput,
  type SessionLength,
} from "@/lib/the-work";

const field =
  "w-full min-h-[48px] border border-paper/25 bg-ink px-4 py-3 text-paper placeholder:text-paper/40 outline-none focus:border-blue focus-visible:ring-2 focus-visible:ring-blue";
const label = "eyebrow text-paper/70 mb-2 block";

export function DeviceNote() {
  return (
    <p className="mt-4 text-[13.5px] text-paper/60 leading-[1.6]">
      Saved on this device only. GRYT doesn't see or store what you enter here. Clearing your
      browser data clears it.
    </p>
  );
}

function ToolShell({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mt-14 border border-paper/20 bg-vintage p-5 sm:p-8 scroll-mt-24"
    >
      <p className="eyebrow text-blue mb-2">Tool</p>
      <h2 id={`${id}-title`} className="display-condensed uppercase text-[clamp(28px,5vw,44px)]">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Choice<T extends string | number>({
  name,
  value,
  options,
  onChange,
  legend,
}: {
  name: string;
  value: T;
  options: Array<{ id: T; label: string; blurb?: string }>;
  onChange: (v: T) => void;
  legend: string;
}) {
  return (
    <fieldset>
      <legend className={label}>{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const on = o.id === value;
          return (
            <label
              key={String(o.id)}
              className={`flex min-h-[48px] cursor-pointer items-start gap-3 border px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-blue ${
                on ? "border-blue bg-blue/10" : "border-paper/25 hover:border-paper/60"
              }`}
            >
              <input
                type="radio"
                name={name}
                className="mt-1 h-4 w-4 accent-[var(--blue)]"
                checked={on}
                onChange={() => onChange(o.id)}
              />
              <span>
                <span className="block font-bold">{o.label}</span>
                {o.blurb ? (
                  <span className="block text-[14px] text-paper/70">{o.blurb}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function useFlash() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 2500);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg, setMsg] as const;
}

function Flash({ msg }: { msg: string }) {
  return (
    <p role="status" aria-live="polite" className="mt-3 min-h-[1.5em] text-[14px] text-blue">
      {msg}
    </p>
  );
}

// ── Program builder ──────────────────────────────────────

const DEFAULT_INPUT: ProgramInput = {
  lane: "back",
  level: 0,
  days: 3,
  minutes: 40,
  equipment: "none",
};

export function ProgramBuilder() {
  const [input, setInput] = useState<ProgramInput>(DEFAULT_INPUT);
  const [program, setProgram] = useState<Program | null>(null);
  const [msg, setMsg] = useFlash();

  useEffect(() => {
    const saved = readWork().program;
    if (saved) {
      setInput(saved);
      setProgram(buildProgram(saved));
    }
  }, []);

  const set = <K extends keyof ProgramInput>(k: K, v: ProgramInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  function build() {
    const p = buildProgram(input);
    setProgram(p);
    writeWork({ program: input });
    track("work_program_built", {
      lane: input.lane,
      level: input.level,
      days: input.days,
      minutes: input.minutes,
      equipment: input.equipment,
    });
    setMsg("Program built and saved on this device.");
    requestAnimationFrame(() =>
      document
        .getElementById("your-program")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <ToolShell id="builder" title="Build your four-week program">
      <div className="grid gap-8">
        <Choice<Lane>
          legend="Your lane"
          name="lane"
          value={input.lane}
          onChange={(v) => set("lane", v)}
          options={LANES.map((l) => ({ id: l.id, label: l.label, blurb: l.blurb }))}
        />
        <Choice<Level>
          legend="Where you're starting"
          name="level"
          value={input.level}
          onChange={(v) => set("level", v)}
          options={LEVELS.map((l) => ({ id: l.id, label: l.label, blurb: l.blurb }))}
        />
        <div className="grid gap-6 sm:grid-cols-3">
          <label>
            <span className={label}>Days a week (incl. Saturday)</span>
            <select
              className={field}
              value={input.days}
              onChange={(e) => set("days", Number(e.target.value) as DaysPerWeek)}
            >
              <option value={3}>3 days</option>
              <option value={4}>4 days</option>
              <option value={5}>5 days</option>
            </select>
          </label>
          <label>
            <span className={label}>Time per weekday session</span>
            <select
              className={field}
              value={input.minutes}
              onChange={(e) => set("minutes", Number(e.target.value) as SessionLength)}
            >
              <option value={20}>About 20 min</option>
              <option value={40}>About 40 min</option>
              <option value={60}>About 60 min</option>
            </select>
          </label>
          <label>
            <span className={label}>Equipment</span>
            <select
              className={field}
              value={input.equipment}
              onChange={(e) => set("equipment", e.target.value as Equipment)}
            >
              <option value="none">None, just me</option>
              <option value="dumbbells">Dumbbells or kettlebell</option>
              <option value="gym">Full gym</option>
            </select>
          </label>
        </div>
        <div>
          <button type="button" onClick={build} className="btn-primary min-h-[48px]">
            Build my program →
          </button>
          <Flash msg={msg} />
        </div>
      </div>

      {program ? <ProgramView program={program} onFlash={setMsg} /> : null}
      <DeviceNote />
    </ToolShell>
  );
}

function SkillChip({ slug }: { slug: string }) {
  const s = skillBySlug(slug);
  if (!s) return null;
  return (
    <Link
      to="/work/skills/$slug"
      params={{ slug }}
      className="inline-flex min-h-[32px] items-center border border-paper/25 px-2.5 text-[12.5px] text-paper/80 hover:border-blue hover:text-blue print:border-black print:text-black"
    >
      {s.name}
    </Link>
  );
}

const WEEK_NOTES = [
  "Should feel like you could do more. That's the point.",
  "Same days, a little more. Missed one? Don't make it up.",
  "Your biggest week. Protect Friday night sleep.",
  "Lighter on purpose. Retest, then build your next block.",
];

function ProgramView({ program, onFlash }: { program: Program; onFlash: (m: string) => void }) {
  return (
    <div id="your-program" className="print-area mt-12 scroll-mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-blue">Your program</p>
          <h3 className="mt-2 text-[22px] md:text-[26px] font-bold leading-[1.25]">
            {program.title}
          </h3>
          <p className="mt-2 max-w-[640px] text-paper/75 text-[15.5px] leading-[1.6]">
            {program.summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            className="btn-ghost min-h-[48px]"
            onClick={async () =>
              onFlash(
                (await copy(programAsText(program)))
                  ? "Copied. Paste it anywhere."
                  : "Copy didn't work in this browser.",
              )
            }
          >
            Copy as text
          </button>
          <button type="button" className="btn-ghost min-h-[48px]" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8">
        {program.weeks.map((w) => (
          <section key={w.week} aria-label={w.label}>
            <h4 className="display-condensed uppercase text-[24px] md:text-[28px] text-blue print:text-black">
              {w.label}
            </h4>
            <ol className="mt-3 grid pl-px pt-px sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-1">
              {w.days.map((d) => (
                <li
                  key={d.day}
                  className={`bg-ink p-4 border border-paper/15 -ml-px -mt-px print:bg-white print:border-0 ${d.session?.saturday ? "outline outline-2 -outline-offset-2 outline-blue" : ""}`}
                >
                  <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-paper/60 print:text-black">
                    {d.day}
                  </p>
                  {d.session ? (
                    <>
                      <p className="mt-1.5 font-bold leading-[1.3]">{d.session.title}</p>
                      <ul className="mt-2 space-y-1.5 text-[14px] leading-[1.5] text-paper/80 print:text-black">
                        {d.session.detail.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-1.5 print:hidden">
                        {Array.from(new Set(d.session.skills)).map((s) => (
                          <SkillChip key={s} slug={s} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="mt-1.5 text-paper/55 text-[14px]">Rest or a walk</p>
                  )}
                </li>
              ))}
              <li className="hidden sm:block bg-ink p-4 border border-paper/15 -ml-px -mt-px print:hidden">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-blue">
                  This week
                </p>
                <p className="mt-1.5 text-[14px] leading-[1.5] text-paper/75">
                  {WEEK_NOTES[w.week - 1]}
                </p>
              </li>
            </ol>
          </section>
        ))}
      </div>
      <p className="mt-6 text-[13.5px] text-paper/60 leading-[1.6] print:text-black">
        Soreness is normal. Sharp pain, limping, or pain that changes how you move means stop and
        get it looked at. General guidance, not medical advice.
      </p>
    </div>
  );
}

// ── Goal card ────────────────────────────────────────────

const EMPTY_GOAL: GoalCard = {
  lane: "back",
  sentence: "",
  date: "",
  why: "",
  benchmark: "The mile",
  floor: "Saturday plus one 20-minute session",
};

export function GoalCardTool() {
  const [g, setG] = useState<GoalCard>(EMPTY_GOAL);
  const [msg, setMsg] = useFlash();
  useEffect(() => {
    const saved = readWork().goal;
    if (saved) setG(saved);
  }, []);
  const set = <K extends keyof GoalCard>(k: K, v: GoalCard[K]) => setG((s) => ({ ...s, [k]: v }));
  const laneLabel = LANES.find((l) => l.id === g.lane)?.label ?? "";
  const dateLabel = g.date
    ? new Date(`${g.date}T12:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "[date]";
  const text = `My GRYT goal (${laneLabel}): By ${dateLabel}, I want to ${g.sentence || "[specific thing]"}, because ${g.why || "[real reason]"}. Benchmark: ${g.benchmark}. My floor: ${g.floor}.`;

  return (
    <ToolShell id="goal-card" title="Your goal card">
      <div className="grid gap-6">
        <Choice<Lane>
          legend="Your lane"
          name="goal-lane"
          value={g.lane}
          onChange={(v) => set("lane", v)}
          options={LANES.map((l) => ({ id: l.id, label: l.label, blurb: l.blurb }))}
        />
        <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
          <label>
            <span className={label}>By</span>
            <input
              type="date"
              className={field}
              value={g.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </label>
          <label>
            <span className={label}>I want to</span>
            <input
              className={field}
              maxLength={140}
              placeholder="run the 5 mile route without walking"
              value={g.sentence}
              onChange={(e) => set("sentence", e.target.value)}
            />
          </label>
        </div>
        <label>
          <span className={label}>Because</span>
          <input
            className={field}
            maxLength={140}
            placeholder="I want to keep up with my kids again"
            value={g.why}
            onChange={(e) => set("why", e.target.value)}
          />
        </label>
        <div className="grid gap-6 sm:grid-cols-2">
          <label>
            <span className={label}>Benchmark I'll track</span>
            <select
              className={field}
              value={g.benchmark}
              onChange={(e) => set("benchmark", e.target.value)}
            >
              <option>The mile</option>
              <option>Push-ups</option>
              <option>Side plank</option>
              <option>Wall sit</option>
              <option>A race result</option>
            </select>
          </label>
          <label>
            <span className={label}>My floor (minimum week)</span>
            <input
              className={field}
              maxLength={80}
              value={g.floor}
              onChange={(e) => set("floor", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="mt-8 border-2 border-blue p-6">
        <p className="eyebrow text-blue">Goal card · {laneLabel}</p>
        <p className="mt-3 text-[20px] md:text-[24px] font-bold leading-[1.35]">
          By {dateLabel}, I want to {g.sentence || "[specific thing]"}, because{" "}
          {g.why || "[real reason]"}.
        </p>
        <p className="mt-4 text-paper/75">
          Benchmark: {g.benchmark} · Floor: {g.floor}
        </p>
        <p className="mt-4 display-condensed uppercase text-[18px]">Do hard things together.</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary min-h-[48px]"
          onClick={() => {
            writeWork({ goal: g });
            track("work_goal_saved", { lane: g.lane });
            setMsg("Saved on this device.");
          }}
        >
          Save
        </button>
        <button
          type="button"
          className="btn-ghost min-h-[48px]"
          onClick={async () =>
            setMsg(
              (await copy(text))
                ? "Copied. Send it to one person."
                : "Copy didn't work in this browser.",
            )
          }
        >
          Copy to share
        </button>
      </div>
      <Flash msg={msg} />
      <DeviceNote />
    </ToolShell>
  );
}

// ── Benchmark log ────────────────────────────────────────

const todayISO = () => new Date().toLocaleDateString("en-CA");
const EMPTY_BENCH = (): BenchmarkEntry => ({
  date: todayISO(),
  mile: "",
  pushups: "",
  pushupHeight: "Floor",
  plankLeft: "",
  plankRight: "",
  wallSit: "",
});

function mileSeconds(v: string): number | null {
  const m = v.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function delta(first: string, last: string, lowerIsBetter = false) {
  const a = lowerIsBetter ? mileSeconds(first) : Number(first);
  const b = lowerIsBetter ? mileSeconds(last) : Number(last);
  if (a == null || b == null || Number.isNaN(a) || Number.isNaN(b) || first === "" || last === "")
    return "";
  const d = lowerIsBetter ? a - b : b - a;
  if (d === 0) return "same";
  if (lowerIsBetter) {
    const s = Math.abs(d);
    return `${d > 0 ? "−" : "+"}${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }
  return `${d > 0 ? "+" : ""}${d}`;
}

export function BenchmarkTool() {
  const [entries, setEntries] = useState<BenchmarkEntry[]>([]);
  const [e, setE] = useState<BenchmarkEntry>(EMPTY_BENCH());
  const [err, setErr] = useState("");
  const [msg, setMsg] = useFlash();
  useEffect(() => setEntries(readWork().benchmarks ?? []), []);
  const set = <K extends keyof BenchmarkEntry>(k: K, v: BenchmarkEntry[K]) =>
    setE((s) => ({ ...s, [k]: v }));

  function add() {
    if (e.mile && mileSeconds(e.mile) == null) {
      setErr("Mile time should look like 9:45.");
      return;
    }
    setErr("");
    const next = [...entries, e].sort((a, b) => a.date.localeCompare(b.date));
    setEntries(next);
    writeWork({ benchmarks: next });
    track("work_benchmark_saved", { entries: next.length });
    setE(EMPTY_BENCH());
    setMsg("Saved on this device.");
  }
  function remove(i: number) {
    const next = entries.filter((_, j) => j !== i);
    setEntries(next);
    writeWork({ benchmarks: next });
  }

  const first = entries[0];
  const last = entries[entries.length - 1];

  return (
    <ToolShell id="benchmark" title="Log your benchmark">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <label>
          <span className={label}>Date</span>
          <input
            type="date"
            className={field}
            value={e.date}
            onChange={(x) => set("date", x.target.value)}
          />
        </label>
        <label>
          <span className={label}>Mile time (min:sec)</span>
          <input
            className={field}
            inputMode="numeric"
            placeholder="10:30"
            value={e.mile}
            aria-invalid={Boolean(err)}
            aria-describedby={err ? "bench-err" : undefined}
            onChange={(x) => set("mile", x.target.value)}
          />
        </label>
        <label>
          <span className={label}>Push-ups in a row</span>
          <input
            className={field}
            type="number"
            min={0}
            value={e.pushups}
            onChange={(x) => set("pushups", x.target.value)}
          />
        </label>
        <label>
          <span className={label}>Push-up height</span>
          <select
            className={field}
            value={e.pushupHeight}
            onChange={(x) => set("pushupHeight", x.target.value)}
          >
            <option>Floor</option>
            <option>Bench or step</option>
            <option>Counter</option>
            <option>Wall</option>
          </select>
        </label>
        <label>
          <span className={label}>Side plank left (sec)</span>
          <input
            className={field}
            type="number"
            min={0}
            max={120}
            value={e.plankLeft}
            onChange={(x) => set("plankLeft", x.target.value)}
          />
        </label>
        <label>
          <span className={label}>Side plank right (sec)</span>
          <input
            className={field}
            type="number"
            min={0}
            max={120}
            value={e.plankRight}
            onChange={(x) => set("plankRight", x.target.value)}
          />
        </label>
        <label>
          <span className={label}>Wall sit (sec)</span>
          <input
            className={field}
            type="number"
            min={0}
            max={180}
            value={e.wallSit}
            onChange={(x) => set("wallSit", x.target.value)}
          />
        </label>
      </div>
      {err ? (
        <p id="bench-err" className="mt-3 text-[14px] text-blue">
          {err}
        </p>
      ) : null}
      <div className="mt-5">
        <button type="button" className="btn-primary min-h-[48px]" onClick={add}>
          Save this test
        </button>
        <Flash msg={msg} />
      </div>

      {entries.length ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[14.5px]">
            <caption className="sr-only">Your benchmark history</caption>
            <thead>
              <tr className="text-left text-paper/60">
                {["Date", "Mile", "Push-ups", "Plank L", "Plank R", "Wall sit", ""].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="border-b border-paper/20 py-2 pr-3 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((x, i) => (
                <tr key={`${x.date}-${i}`}>
                  <td className="border-b border-paper/10 py-2 pr-3">{x.date}</td>
                  <td className="border-b border-paper/10 py-2 pr-3">{x.mile || "–"}</td>
                  <td className="border-b border-paper/10 py-2 pr-3">
                    {x.pushups || "–"} <span className="text-paper/50">({x.pushupHeight})</span>
                  </td>
                  <td className="border-b border-paper/10 py-2 pr-3">{x.plankLeft || "–"}</td>
                  <td className="border-b border-paper/10 py-2 pr-3">{x.plankRight || "–"}</td>
                  <td className="border-b border-paper/10 py-2 pr-3">{x.wallSit || "–"}</td>
                  <td className="border-b border-paper/10 py-2">
                    <button
                      type="button"
                      className="min-h-[44px] px-2 text-paper/60 underline hover:text-blue"
                      onClick={() => remove(i)}
                      aria-label={`Delete test from ${x.date}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {entries.length > 1 ? (
                <tr className="font-bold text-blue">
                  <td className="py-2 pr-3">Change</td>
                  <td className="py-2 pr-3">{delta(first.mile, last.mile, true)}</td>
                  <td className="py-2 pr-3">
                    {first.pushupHeight === last.pushupHeight
                      ? delta(first.pushups, last.pushups)
                      : "new height"}
                  </td>
                  <td className="py-2 pr-3">{delta(first.plankLeft, last.plankLeft)}</td>
                  <td className="py-2 pr-3">{delta(first.plankRight, last.plankRight)}</td>
                  <td className="py-2 pr-3">{delta(first.wallSit, last.wallSit)}</td>
                  <td />
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
      <DeviceNote />
    </ToolShell>
  );
}

// ── Sunday check-in ──────────────────────────────────────

const EMPTY_CHECK = (): CheckIn => ({
  date: todayISO(),
  floor: "",
  well: "",
  hurt: "",
  change: "",
});

export function CheckInTool() {
  const [c, setC] = useState<CheckIn>(EMPTY_CHECK());
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [msg, setMsg] = useFlash();
  useEffect(() => setHistory(readWork().checkIns ?? []), []);
  const set = <K extends keyof CheckIn>(k: K, v: CheckIn[K]) => setC((s) => ({ ...s, [k]: v }));
  const text = [
    `GRYT check-in, ${c.date}`,
    `Hit my floor: ${c.floor === "yes" ? "yes" : c.floor === "no" ? "no" : "?"}`,
    c.well && `Went well: ${c.well}`,
    c.hurt && `Got in the way: ${c.hurt}`,
    c.change && `Next week I'm changing: ${c.change}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <ToolShell id="check-in" title="Sunday check-in">
      <div className="grid gap-6">
        <Choice<"yes" | "no" | "">
          legend="Did you hit your floor this week?"
          name="floor"
          value={c.floor}
          onChange={(v) => set("floor", v)}
          options={[
            { id: "yes", label: "Yes" },
            { id: "no", label: "No" },
          ]}
        />
        <label>
          <span className={label}>What went well?</span>
          <input
            className={field}
            maxLength={140}
            value={c.well}
            onChange={(e) => set("well", e.target.value)}
          />
        </label>
        <label>
          <span className={label}>What hurt or got in the way?</span>
          <input
            className={field}
            maxLength={140}
            value={c.hurt}
            onChange={(e) => set("hurt", e.target.value)}
          />
          <span className="mt-2 block text-[13.5px] text-paper/60">
            Keep health details to what you're comfortable sharing. Pain that changes how you move
            is worth getting checked.
          </span>
        </label>
        <label>
          <span className={label}>One change for next week</span>
          <input
            className={field}
            maxLength={140}
            value={c.change}
            onChange={(e) => set("change", e.target.value)}
          />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary min-h-[48px]"
          onClick={() => {
            const next = [c, ...history].slice(0, 12);
            setHistory(next);
            writeWork({ checkIns: next });
            track("work_checkin_saved", { floor: c.floor || "unset" });
            setMsg("Saved on this device.");
          }}
        >
          Save check-in
        </button>
        <button
          type="button"
          className="btn-ghost min-h-[48px]"
          onClick={async () =>
            setMsg(
              (await copy(text))
                ? "Copied. Send it to your crew."
                : "Copy didn't work in this browser.",
            )
          }
        >
          Copy for your crew
        </button>
      </div>
      <Flash msg={msg} />
      {history.length ? (
        <div className="mt-6">
          <p className="eyebrow text-paper/60 mb-2">Recent check-ins</p>
          <ul className="space-y-2 text-[14.5px] text-paper/80">
            {history.slice(0, 4).map((h, i) => (
              <li key={`${h.date}-${i}`}>
                {h.date}: floor {h.floor || "?"}
                {h.change ? ` · changing: ${h.change}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <DeviceNote />
    </ToolShell>
  );
}
