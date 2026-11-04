import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getClubStats } from "@/lib/strava-club.functions";
import { getAttendanceStats } from "@/lib/attendance.functions";
import { SAMPLE_CLUB_STATS, STRAVA_CLUB_URL } from "@/lib/strava-club";
import { STRAVA_MEMBERS_LABEL, STRAVA_TOTAL_MILES_LABEL } from "@/lib/club-stats";
import { StravaClubEmbed } from "./StravaClubEmbed";
import trailPhoto from "@/assets/photos/run-club-5.jpg.asset.json";

// Snapshot of Strava's "Last week's leaders" (week of Sep 14, 2026), copied by
// hand. Strava's API has no leaderboard endpoint, so update this each week.
// Names are shortened to first name + last initial, as Strava does in its own API.
const LEADERS_WEEK = "Week of Sep 14";
const LEADERS: { title: string; rows: [string, string][] }[] = [
  { title: "Distance", rows: [["Zac K.", "46.8 mi"], ["Brenden P.", "40.0 mi"], ["Nick M.", "39.7 mi"]] },
  { title: "Time on feet", rows: [["Nick M.", "6:37:32"], ["Zac K.", "6:17:27"], ["Jen P.", "5:58:26"]] },
  { title: "Climbing", rows: [["Mark W.", "2,693 ft"], ["Alex C.", "2,282 ft"], ["Nick M.", "2,159 ft"]] },
];

function Leaderboard() {
  return (
    <div className="mt-6 border border-foreground/20 bg-background/50">
      <div className="flex items-baseline justify-between gap-4 border-b border-foreground/15 px-4 sm:px-5 py-3">
        <span className="text-[10px] tracking-[0.22em] uppercase text-foreground">Last week's leaders</span>
        <span className="text-[10px] tracking-[0.14em] uppercase text-foreground/70">{LEADERS_WEEK}</span>
      </div>
      <div className="grid sm:grid-cols-3">
        {LEADERS.map((cat) => (
          <div key={cat.title} className="border-b sm:border-b-0 sm:border-r last:border-0 border-foreground/10">
            <div className="px-4 sm:px-5 pt-3 pb-1 text-[11px] tracking-[0.14em] uppercase text-foreground/75">
              {cat.title}
            </div>
            <ol>
              {cat.rows.map(([name, value], i) => (
                <li key={name + i} className="flex items-baseline justify-between gap-3 px-4 sm:px-5 py-2">
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="display-condensed text-foreground text-[18px] w-4">{i + 1}</span>
                    <span className="display-condensed text-[18px] truncate">{name}</span>
                  </span>
                  <span className="text-[13px] text-foreground/80 shrink-0">{value}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-foreground/20 bg-background/50 p-4 sm:p-5">
      <div className="display-condensed text-[clamp(32px,8vw,56px)] leading-[0.92] text-foreground">
        {value}
      </div>
      <div className="mt-1 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-foreground/75">
        {label}
      </div>
    </div>
  );
}

export function ClubStats() {
  const fetchStats = useServerFn(getClubStats);
  const { data } = useQuery({
    queryKey: ["strava-club-stats"],
    queryFn: () => fetchStats(),
    staleTime: 30 * 60 * 1000,
  });
  const stats = data ?? SAMPLE_CLUB_STATS;

  const fetchAttendance = useServerFn(getAttendanceStats);
  const { data: attendance } = useQuery({
    queryKey: ["gryt-attendance-stats"],
    queryFn: () => fetchAttendance(),
    staleTime: 30 * 60 * 1000,
  });

  return (
    <section
      id="club-stats"
      className="relative overflow-hidden text-foreground py-14 md:py-20 px-6 sm:px-12 lg:px-24"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${trailPhoto.url})` }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,8,8,0.55), rgba(8,8,8,0.72) 45%, rgba(8,8,8,0.88))",
        }}
      />
      <div className="relative max-w-[1180px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-3">On Strava</div>
        <h2 className="display-condensed text-[clamp(30px,7vw,64px)] leading-[0.94]">
          THE CREW IN NUMBERS
        </h2>

        {stats.isSample ? (
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Figure value={STRAVA_MEMBERS_LABEL} label="Members on Strava" />
            <Figure value={STRAVA_TOTAL_MILES_LABEL} label="Miles run together" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Figure value={String(stats.members)} label="Members" />
            <Figure value={stats.recentMiles.toLocaleString()} label="Recent club miles" />
            <Figure value={stats.totalMiles.toLocaleString()} label="Club miles" />
            <Figure value={String(stats.runsLogged)} label="Runs logged" />
          </div>
        )}

        {attendance && attendance.runsCounted > 0 ? (
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Figure
              value={String(attendance.longestActiveStreak)}
              label="Longest Saturday streak"
            />
            <Figure value={String(attendance.lastRunAttendance)} label="At the last run" />
            <Figure value={String(attendance.peopleCounted)} label="Checked in this season" />
            <Figure value={String(attendance.runsCounted)} label="Saturdays counted" />
          </div>
        ) : null}

        {!stats.isSample && stats.recentRuns.length > 0 ? (
          <div className="mt-6 border border-foreground/20 bg-background/50">
            <div className="border-b border-foreground/15 px-4 sm:px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-foreground">
              Recent group runs
            </div>
            <ul>
              {stats.recentRuns.map((run) => (
                <li
                  key={run.id}
                  className="flex items-baseline justify-between gap-4 border-b border-foreground/10 last:border-b-0 px-4 sm:px-5 py-3"
                >
                  <div className="min-w-0">
                    <div className="display-condensed text-[17px] sm:text-[20px] truncate">
                      {run.name}
                    </div>
                    <div className="text-[12px] text-foreground/70">
                      {run.date
                        ? new Date(`${run.date}T12:00:00`).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent"}
                      {run.runners > 1 ? ` · ${run.runners} runners` : ""}
                    </div>
                  </div>
                  <div className="display-condensed shrink-0 text-foreground text-[18px] sm:text-[22px]">
                    {run.distanceMi} mi
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Leaderboard />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 items-start">
          <StravaClubEmbed variant="summary" />
          <StravaClubEmbed variant="activity" />
        </div>

        <a
          href={STRAVA_CLUB_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-primary mt-7"
        >
          Join the club on Strava
        </a>
      </div>
    </section>
  );
}
