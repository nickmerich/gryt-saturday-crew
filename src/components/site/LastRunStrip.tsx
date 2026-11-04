import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRunReports } from "@/lib/run-reports.functions";
import { RUN_REPORTS_QUERY_KEY, milestoneLines, plural, shortDate } from "@/components/site/RunReportBits";

/** "Last Saturday" proof line on the homepage. Hidden until there is real data. */
export function LastRunStrip() {
  const fetchReports = useServerFn(getRunReports);
  const { data } = useQuery({
    queryKey: RUN_REPORTS_QUERY_KEY,
    queryFn: () => fetchReports(),
    staleTime: 5 * 60 * 1000,
  });
  const last = data?.ok ? data.reports[0] : undefined;
  if (!last || last.runners <= 0) return null;
  const bits = [plural(last.runners, "runner", "runners")];
  if (last.firstTimers) bits.push(plural(last.firstTimers, "first-timer", "first-timers"));
  const ms = milestoneLines(last);
  return (
    <section aria-label="Last Saturday" className="border-t border-foreground/15 px-6 sm:px-12 lg:px-24 py-8">
      <div className="mx-auto max-w-[1180px] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-[16px] md:text-[18px]">
          <span className="eyebrow text-foreground mr-3">Last Saturday</span>
          <span className="font-bold">Run #{last.runNumber}</span>
          <span className="text-foreground/75"> · {shortDate(last.date)} · {bits.join(" · ")}</span>
          {ms.length ? <span className="text-foreground"> · {ms[0]}</span> : null}
        </p>
        <div className="flex gap-6 shrink-0">
          <Link to="/runs/$number" params={{ number: String(last.runNumber) }} className="text-sm font-bold text-foreground underline underline-offset-4 hover:text-foreground">
            Read the report →
          </Link>
          <Link to="/milestones" className="text-sm text-foreground/80 underline underline-offset-4 hover:text-foreground/70">
            Milestone Club
          </Link>
        </div>
      </div>
    </section>
  );
}
