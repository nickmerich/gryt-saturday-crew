import { STRAVA_CLUB_URL } from "@/lib/strava-club";

export function ClubStats() {
  return (
    <section id="club-stats" className="gryt-utility-section" aria-labelledby="strava-title">
      <div className="gryt-utility-inner">
        <p className="eyebrow eyebrow-blue">Keep in touch between Saturdays</p>
        <h2 id="strava-title" className="gryt-utility-title">
          Find the crew on Strava.
        </h2>
        <p className="gryt-utility-intro">
          Join the club, share your own runs, and stay connected. You do not need a Strava account
          to RSVP or run with us.
        </p>
        <a
          href={STRAVA_CLUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-5"
        >
          Open the Strava club
        </a>
        <p className="mt-5 text-sm text-paper/70">
          Weekly mileage, activity lists and attendance streaks are not published here. An activity
          on Strava is not a Saturday check-in.
        </p>
      </div>
    </section>
  );
}
