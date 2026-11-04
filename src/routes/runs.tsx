import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { SaturdayInvite } from "@/components/site/GuideShell";
import { getRunReports } from "@/lib/run-reports.functions";
import { RUN_REPORT_NOTES } from "@/content/run-reports";
import {
  RUN_REPORTS_QUERY_KEY,
  StatTile,
  longDate,
  milestoneLines,
  plural,
} from "@/components/site/RunReportBits";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/runs`;
const TITLE = "Weekly Run Reports · gryt run club";
const DESCRIPTION =
  "Every GRYT Saturday, counted: runners, first-timers, people who came back, and Milestone Club moments from the free 7 AM run at Peterswood Park in McMurray.";

export const Route = createFileRoute("/runs")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE}/og-resources.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: RunsIndex,
});

function RunsIndex() {
  const fetchReports = useServerFn(getRunReports);
  const { data, isPending } = useQuery({
    queryKey: RUN_REPORTS_QUERY_KEY,
    queryFn: () => fetchReports(),
    staleTime: 5 * 60 * 1000,
  });
  const reports = data?.reports ?? [];
  const totals = data?.totals;
  const hasData = !!data?.ok && reports.length > 0;

  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      <section className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[1080px] mx-auto">
          <p className="eyebrow text-foreground mb-5">Every Saturday, counted</p>
          <h1 className="display-condensed uppercase text-[clamp(44px,8vw,112px)] leading-[0.92]">
            Run Reports
          </h1>
          <p className="mt-7 max-w-[680px] text-foreground/80 text-lg md:text-xl leading-[1.55]">
            Who showed up, who was new, who came back, and who hit a milestone. Numbers come straight
            from Saturday check-ins. Names only appear when someone says yes.
          </p>

          {hasData && totals ? (
            <div className="mt-10 grid gap-px bg-foreground/20 border border-foreground/20 sm:grid-cols-3">
              <StatTile label="Saturdays reported" value={String(totals.runsTracked)} sub={`Since ${longDate(totals.trackedSince!)}`} />
              <StatTile label="People who showed up" value={String(totals.peopleTracked)} />
              <StatTile label="Check-ins" value={String(totals.totalCheckins)} sub="Every walk, run, and sweep" />
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              RSVP for Saturday →
            </Link>
            <Link
              to="/milestones"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-foreground/40 text-foreground hover:border-blue hover:text-foreground/70 transition-colors"
            >
              The Milestone Club
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[1080px] mx-auto">
          {isPending ? (
            <p className="text-foreground/75" role="status">
              Loading reports…
            </p>
          ) : hasData ? (
            <ol className="grid gap-px bg-foreground/20 border border-foreground/20">
              {reports.map((r) => {
                const note = RUN_REPORT_NOTES[r.runNumber];
                const lines = milestoneLines(r);
                return (
                  <li key={r.date} className="bg-background">
                    <Link
                      to="/runs/$number"
                      params={{ number: String(r.runNumber) }}
                      className="group grid gap-4 p-6 md:p-7 md:grid-cols-[180px_1fr_auto] md:items-center hover:bg-background transition-colors"
                    >
                      <div>
                        <p className="display-condensed text-[40px] leading-none">#{r.runNumber}</p>
                        <p className="mt-1 text-[12px] tracking-[0.16em] uppercase text-foreground/75 font-mono">
                          {longDate(r.date)}
                        </p>
                      </div>
                      <div>
                        {note?.headline ? <p className="font-bold text-[18px] leading-snug">{note.headline}</p> : null}
                        <p className={`${note?.headline ? "mt-1 " : ""}text-foreground/80`}>
                          {plural(r.runners, "runner", "runners")}
                          {r.firstTimers != null && r.firstTimers > 0 ? ` · ${plural(r.firstTimers, "first-timer", "first-timers")}` : ""}
                          {r.returning != null && r.returning > 0 ? ` · ${r.returning} came back` : ""}
                        </p>
                        {lines.length ? <p className="mt-1 text-foreground text-[14px]">{lines.join(" · ")}</p> : null}
                      </div>
                      <span className="text-[12px] tracking-[0.22em] uppercase text-foreground group-hover:text-foreground font-mono">
                        Read report →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="border border-foreground/20 p-6 md:p-8 max-w-[720px]">
              <p className="font-bold text-[18px]">The first report posts after the next checked-in Saturday.</p>
              <p className="mt-2 text-foreground/75">
                Reports are built from Saturday check-ins, so they start with the first run we check people
                in at. Come be part of it.
              </p>
            </div>
          )}

          <div className="max-w-[820px]">
            <SaturdayInvite />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
