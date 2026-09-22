import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { newYorkParts, runsForMonth, runsIcs } from "@/lib/run-occurrence";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const Route = createFileRoute("/calendar")({
  loader: () => ({ today: newYorkParts() }),
  head: () => ({
    meta: [
      { title: "Run Calendar · Saturdays 7 AM | GRYT Run Club" },
      {
        name: "description",
        content:
          "GRYT Saturday runs, month by month. Check current status, meeting details and exceptions before travelling.",
      },
      { property: "og:title", content: "GRYT Run Calendar" },
      {
        property: "og:description",
        content: "Current Saturday run details and calendar downloads.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grytrunclub.com/calendar" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/calendar" }],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const { today } = Route.useLoaderData();
  const [cursor, setCursor] = useState({ year: today.year, month: today.month - 1 });
  const runs = useMemo(() => runsForMonth(cursor.year, cursor.month), [cursor]);
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1)).getUTCDay();
    const days = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
    return [
      ...Array.from({ length: first }, () => null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ];
  }, [cursor]);
  function shift(delta: number) {
    setCursor((c) => {
      const date = new Date(Date.UTC(c.year, c.month + delta, 1));
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
    });
  }
  return (
    <>
      <SiteNav />
      <main className="gryt-clean gryt-clean-calendar bg-ink text-paper">
        <section className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-24">
          <p className="eyebrow text-blue mb-4">SATURDAYS · ALL PACES · FREE</p>
          <h1 className="display-condensed text-5xl sm:text-6xl uppercase">Run Calendar</h1>
          <p className="mt-5 max-w-xl text-paper/70 leading-relaxed">
            No membership required. RSVP and sign the required waiver before your first run. Check
            each run’s status before travelling; calendar downloads are snapshots, not a live
            subscription.
          </p>
          <div className="mt-12 flex items-center justify-between gap-3 border-b border-paper/15 pb-4">
            <button
              onClick={() => shift(-1)}
              disabled={!interactive}
              aria-label="Previous month"
              className="border border-paper/25 px-3 py-2 text-sm"
            >
              ← Prev
            </button>
            <h2 aria-live="polite" className="display-condensed text-2xl sm:text-4xl text-center">
              {MONTHS[cursor.month]} {cursor.year}
            </h2>
            <button
              onClick={() => shift(1)}
              disabled={!interactive}
              aria-label="Next month"
              className="border border-paper/25 px-3 py-2 text-sm"
            >
              Next →
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-px bg-paper/15 border border-paper/15">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={i} className="bg-ink py-2 text-center text-xs text-paper/60">
                {day}
              </div>
            ))}
            {cells.map((day, i) => {
              const run = runs.find((r) => Number(r.localDate.slice(-2)) === day);
              return (
                <div key={i} className="bg-ink min-h-[86px] sm:min-h-[104px] p-1 sm:p-2">
                  {day && (
                    <>
                      <span
                        className={
                          today.day === day &&
                          today.year === cursor.year &&
                          today.month - 1 === cursor.month
                            ? "bg-blue text-ink px-1 font-bold"
                            : "text-paper/70"
                        }
                      >
                        {day}
                      </span>
                      {run && (
                        <a
                          href={`#${run.id}`}
                          className="mt-2 block text-xs bg-blue text-ink p-1 break-words"
                        >
                          {run.status === "cancelled"
                            ? "Cancelled"
                            : run.status === "unconfirmed"
                              ? "Pending"
                              : run.timeLabel}
                        </a>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <ul className="mt-8 space-y-4">
            {runs.map((run) => (
              <li key={run.id} id={run.id} className="scroll-mt-24 border border-paper/20 p-4">
                <h3 className="font-semibold">{run.label}</h3>
                <p className="mt-2 text-sm text-blue capitalize">{run.status}</p>
                <p className="mt-1 text-sm">
                  {run.location} · {run.route}
                </p>
                {run.notice && <p className="mt-2 text-sm">{run.notice}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={"data:text/calendar;charset=utf-8," + encodeURIComponent(runsIcs(runs))}
              download={`gryt-${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}.ics`}
              className="bg-blue text-ink px-5 py-3 text-sm font-bold"
            >
              Download {MONTHS[cursor.month]} calendar
            </a>
            <Link to="/" hash="join" className="border border-paper/30 px-5 py-3 text-sm">
              RSVP for the current run
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
