import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAttendanceStats } from "@/lib/attendance.functions";
import { STRAVA_CLUB_URL } from "@/lib/strava-club";
import { useStravaClubStats } from "@/hooks/useStravaClubStats";
import { StravaMemberCount } from "./StravaMemberCount";
import { StravaClubEmbed } from "./StravaClubEmbed";
import trailPhoto from "@/assets/photos/run-club-5.jpg.asset.json";

function Figure({ value, label }: { value: React.ReactNode; label: string }) {
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
  const { data: stats } = useStravaClubStats();
  const fetchAttendance = useServerFn(getAttendanceStats);
  const { data: attendance } = useQuery({
    queryKey: ["gryt-attendance-stats"],
    queryFn: () => fetchAttendance(),
    staleTime: 30 * 60 * 1000,
  });
  return (
    <section
      id="club-stats"
      className="relative overflow-hidden text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24"
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
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Figure value={<StravaMemberCount />} label="Members on Strava" />
        </div>
        <p className="mt-3 text-xs text-paper/70" role="status">
          {stats.fetchedAt
            ? `Last verified ${new Date(stats.fetchedAt).toLocaleString("en-US", { timeZone: "America/New_York" })} ET. `
            : "A verified member count will appear when Strava is connected. "}
          Counts refresh automatically while this page is open. Membership is not attendance.
        </p>
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
        {/* Official embeds replace copied leaderboards and misleading all-time totals. */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 items-start">
          <StravaClubEmbed variant="summary" />
          <StravaClubEmbed variant="activity" />
        </div>
        <a href={STRAVA_CLUB_URL} target="_blank" rel="noreferrer" className="btn-primary mt-7">
          Join the club on Strava
        </a>
      </div>
    </section>
  );
}
