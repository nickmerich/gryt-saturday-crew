/**
 * Official Strava club widget. Renders real, live club activity straight from
 * Strava — no API token required. Numbers above it come from the club API.
 */
export function StravaClubEmbed() {
  return (
    <div className="mt-6 border border-paper/20 bg-ink/50">
      <div className="border-b border-paper/15 px-4 sm:px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-blue">
        Live from Strava
      </div>
      <div className="p-3 sm:p-4">
        <iframe
          title="GRYT Run Club on Strava"
          allowTransparency
          frameBorder="0"
          height={160}
          scrolling="no"
          loading="lazy"
          src="https://www.strava.com/clubs/1708552/latest-rides/b76ca42ddb400c392ceee3ee06c641b84d840862?show_rides=false"
          className="w-full max-w-[300px] bg-paper"
        />
      </div>
    </div>
  );
}
