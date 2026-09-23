const BASE =
  "https://www.strava.com/clubs/1708552/latest-rides/b76ca42ddb400c392ceee3ee06c641b84d840862";

/**
 * Official Strava club widgets. Real, live club activity straight from Strava,
 * no API token required.
 */
export function StravaClubEmbed({ variant = "summary" }: { variant?: "summary" | "activity" }) {
  const activity = variant === "activity";
  return (
    <div className="border border-paper/20 bg-ink/50">
      <div className="border-b border-paper/15 px-4 sm:px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-blue">
        {activity ? "Latest runs on Strava" : "This week on Strava"}
      </div>
      <div className="p-3 sm:p-4">
        <iframe
          title={activity ? "GRYT Run Club latest runs on Strava" : "GRYT Run Club this week on Strava"}
          allowTransparency
          frameBorder="0"
          height={activity ? 454 : 160}
          scrolling="no"
          loading="lazy"
          src={`${BASE}?show_rides=${activity ? "true" : "false"}`}
          className="w-full max-w-[300px] bg-paper"
        />
      </div>
    </div>
  );
}
