export const STRAVA_CLUB_ID = 1708552;
export const STRAVA_CLUB_URL = "https://www.strava.com/clubs/1708552";
export const STRAVA_CACHE_MS = 15 * 60 * 1000;
export const STRAVA_MAX_STALE_MS = 24 * 60 * 60 * 1000;

/** Public aggregate only. Never put credentials or athlete activities here. */
export type ClubStats = {
  status: "live" | "stale" | "unavailable";
  members: number | null;
  fetchedAt: string | null;
  note: string | null;
};

export const UNAVAILABLE_CLUB_STATS: ClubStats = {
  status: "unavailable",
  members: null,
  fetchedAt: null,
  note: "Strava member count is temporarily unavailable.",
};

export function memberCountLabel(stats?: ClubStats): string {
  return stats?.members != null && stats.status !== "unavailable"
    ? stats.members.toLocaleString("en-US")
    : "...";
}

/** A suspended tab or failing request must not keep an old count labelled live. */
export function ageClubStats(stats: ClubStats, now = Date.now()): ClubStats {
  const at = stats.fetchedAt ? Date.parse(stats.fetchedAt) : NaN;
  const age = now - at;
  if (
    !Number.isSafeInteger(stats.members) ||
    (stats.members ?? -1) < 0 ||
    !Number.isFinite(at) ||
    age < -60_000 ||
    age > STRAVA_MAX_STALE_MS
  ) {
    return { ...UNAVAILABLE_CLUB_STATS };
  }
  return age >= STRAVA_CACHE_MS || stats.status === "stale"
    ? { ...stats, status: "stale", note: "Last verified count. Refresh pending." }
    : stats;
}
