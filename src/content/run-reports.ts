// Organizer notes for weekly run reports, keyed by official run number.
//
// The numbers on each report (runners, first-timers, milestones) come from
// check-ins automatically. Everything in this file is optional color that an
// organizer adds by hand after the run.
//
// PRIVACY: only add a first name to `shoutouts` or `welcomed` when that
// person has said yes to being named publicly. Never add last names, emails,
// phones, or anything from a waiver. Photos must be real GRYT photos the
// people in them are comfortable with.

export type RunReportNote = {
  /** One line for the top of the report. Example: "Frost on the trail, coffee at the lot." */
  headline?: string;
  /** A few sentences about the morning. Plain text, no emojis. */
  story?: string;
  /** Weather at the start, in your words. Example: "36°F, sunny, no wind." */
  weather?: string;
  /** Real photo URL (Lovable asset or CDN). */
  photo?: string;
  photoAlt?: string;
  /** Opt-in first names to thank: buddies, sweepers, greeters. */
  shoutouts?: string[];
  /** Opt-in first names of first-timers who said yes to a public welcome. */
  welcomed?: string[];
  /**
   * The Saturday Soundtrack. Build the playlist from /admin/soundtrack, name it
   * "GRYT Run #N", make it public on Spotify, and paste the share link here.
   * `name` is only allowed when that runner ticked "credit my first name" on
   * their RSVP. The admin page's "Copy for run report" button respects this.
   */
  soundtrack?: {
    spotifyUrl: string;
    credits?: { song: string; name?: string }[];
  };
};

export const RUN_REPORT_NOTES: Record<number, RunReportNote> = {
  // 25: {
  //   headline: "Frost on the trail, coffee at the lot.",
  //   weather: "36°F, sunny, no wind.",
  //   story: "…",
  //   shoutouts: ["Laura"],
  //   welcomed: [],
  //   soundtrack: {
  //     spotifyUrl: "https://open.spotify.com/playlist/…",
  //     credits: [{ song: "Dreams - Fleetwood Mac", name: "Laura" }, { song: "…" }],
  //   },
  // },
};
