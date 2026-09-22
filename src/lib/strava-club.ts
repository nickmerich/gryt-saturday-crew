// Shape of the GRYT club stats surface. Shared by the server fn and the UI so
// live Strava data can drop straight into the sample-data slot.

export const STRAVA_CLUB_ID = 1708552;
export const STRAVA_CLUB_URL = "https://www.strava.com/clubs/1708552";

export type ClubRun = {
  id: string;
  name: string;
  /** ISO date string */
  date: string;
  distanceMi: number;
  runners: number;
  elevationFt: number | null;
};

export type ClubStats = {
  /** true when the numbers are placeholders, not live Strava data */
  isSample: boolean;
  members: number;
  /**
   * Miles across the most recent club activities. Strava's club feed carries
   * no timestamps, so this is a recent-feed total, never a weekly figure.
   */
  recentMiles: number;
  totalMiles: number;
  runsLogged: number;
  recentRuns: ClubRun[];
  /** ISO timestamp of the read, or null for sample data */
  fetchedAt: string | null;
  /** plain-language reason live data isn't in yet */
  note: string | null;
};

export const SAMPLE_CLUB_STATS: ClubStats = {
  isSample: true,
  members: 82,
  recentMiles: 214,
  totalMiles: 4860,
  runsLogged: 318,
  recentRuns: [
    { id: "s1", name: "Saturday Montour", date: "2026-09-19", distanceMi: 5.0, runners: 14, elevationFt: 92 },
    { id: "s2", name: "Saturday Montour", date: "2026-09-12", distanceMi: 6.2, runners: 11, elevationFt: 118 },
    { id: "s3", name: "Saturday Montour", date: "2026-09-05", distanceMi: 3.1, runners: 17, elevationFt: 64 },
  ],
  fetchedAt: null,
  note: "Sample numbers. Live Strava club data lands once the club token is added.",
};
