import { RUN_ANCHOR_MS, RUN_ANCHOR_NUMBER } from "@/lib/run-schedule";
import { MILESTONE_NAMES, type RunReportSummary } from "@/lib/run-reports";

export const RUN_REPORTS_QUERY_KEY = ["run-reports"] as const;

/** Official run number -> YYYY-MM-DD (Saturday). Inverse of runNumberForDate. */
export function dateForRunNumber(n: number): string {
  const ms = RUN_ANCHOR_MS + (n - RUN_ANCHOR_NUMBER) * 7 * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

export function longDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!, 12)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function shortDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!, 12)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** "2 runners reached The 5 Club" lines for a report. */
export function milestoneLines(r: RunReportSummary): string[] {
  return r.milestones.map(
    (m) => `${plural(m.count, "runner", "runners")} reached ${MILESTONE_NAMES[m.milestone]}`,
  );
}

export function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-ink p-5 md:p-6">
      <p className="text-[11px] tracking-[0.2em] uppercase text-paper/60 font-mono">{label}</p>
      <p className="mt-2 display-condensed text-[48px] md:text-[60px] leading-none tabular-nums">{value}</p>
      {sub ? <p className="mt-2 text-[13px] text-paper/60">{sub}</p> : null}
    </div>
  );
}
