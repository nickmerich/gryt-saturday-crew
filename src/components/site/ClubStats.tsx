import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getClubStats } from "@/lib/strava-club.functions";
import { getAttendanceStats } from "@/lib/attendance.functions";
import { SAMPLE_CLUB_STATS, STRAVA_CLUB_URL } from "@/lib/strava-club";
import { STRAVA_MEMBERS_LABEL } from "@/lib/club-stats";
import { StravaClubEmbed } from "./StravaClubEmbed";
import trailPhoto from "@/assets/photos/run-club-5.jpg.asset.json";

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-paper/20 bg-ink/50 p-4 sm:p-5">
      <div className="display-condensed text-[clamp(32px,8vw,56px)] leading-[0.92] text-blue">
        {value}
      </div>
      <div className="mt-1 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-paper/60">
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
      className="relative overflow-hidden text-paper py-14 sm:py-20 px-5 sm:px-12 lg:px-24"
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
          <div className="mt-6 border border-paper/20 bg-ink/50">
            <div className="border-b border-paper/15 px-4 sm:px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-blue">
              Recent group runs
            </div>
            <ul>
              {stats.recentRuns.map((run) => (
                <li
                  key={run.id}
                  className="flex items-baseline justify-between gap-4 border-b border-paper/10 last:border-b-0 px-4 sm:px-5 py-3"
                >
                  <div className="min-w-0">
                    <div className="display-condensed text-[17px] sm:text-[20px] truncate">
                      {run.name}
                    </div>
                    <div className="text-[12px] text-paper/55">
                      {run.date
                        ? new Date(`${run.date}T12:00:00`).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent"}
                      {run.runners > 1 ? ` · ${run.runners} runners` : ""}
                    </div>
                  </div>
                  <div className="display-condensed shrink-0 text-blue text-[18px] sm:text-[22px]">
                    {run.distanceMi} mi
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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
