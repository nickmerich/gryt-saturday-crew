export const STRAVA_CLUB_ID = 1708552;
export const STRAVA_CLUB_URL = "https://www.strava.com/clubs/1708552";
export type ClubStats = {
  status: "unavailable";
  members: null;
  weeklyMiles: null;
  totalMiles: null;
  longestStreakWeeks: null;
  recentRuns: never[];
  note: string;
};
export const UNAVAILABLE_CLUB_STATS: ClubStats = {
  status: "unavailable",
  members: null,
  weeklyMiles: null,
  totalMiles: null,
  longestStreakWeeks: null,
  recentRuns: [],
  note: "Public club statistics are not connected. View the club directly on Strava.",
};
