import { createServerFn } from "@tanstack/react-start";
import {
  SAMPLE_CLUB_STATS,
  STRAVA_CLUB_ID,
  type ClubRun,
  type ClubStats,
} from "./strava-club";

const M_TO_MI = 0.000621371;
const M_TO_FT = 3.28084;

async function clubAccessToken(): Promise<string | null> {
  const clientId = process.env["STRAVA_CLIENT_ID"];
  const clientSecret = process.env["STRAVA_CLIENT_SECRET"];
  const refreshToken = process.env["STRAVA_CLUB_REFRESH_TOKEN"];
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    console.error(`Strava club refresh failed [${res.status}]: ${await res.text()}`);
    return null;
  }
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

/**
 * Live club stats when a club-member refresh token is configured, otherwise
 * clearly-labelled sample data with the same shape.
 */
export const getClubStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<ClubStats> => {
    try {
      const token = await clubAccessToken();
      if (!token) {
        return {
          ...SAMPLE_CLUB_STATS,
          note: "Sample numbers. Connect the club Strava account to go live.",
        };
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [clubRes, actRes] = await Promise.all([
        fetch(`https://www.strava.com/api/v3/clubs/${STRAVA_CLUB_ID}`, { headers }),
        fetch(
          `https://www.strava.com/api/v3/clubs/${STRAVA_CLUB_ID}/activities?per_page=60`,
          { headers },
        ),
      ]);

      if (!clubRes.ok) {
        console.error(`Strava club fetch failed [${clubRes.status}]: ${await clubRes.text()}`);
        return { ...SAMPLE_CLUB_STATS, note: "Strava didn't answer. Showing sample numbers." };
      }
      const club = (await clubRes.json()) as { member_count?: number };

      type RawActivity = {
        name?: string;
        distance?: number;
        total_elevation_gain?: number;
        type?: string;
        sport_type?: string;
        athlete?: { firstname?: string; lastname?: string };
      };
      const activities: RawActivity[] = actRes.ok ? await actRes.json() : [];
      if (!actRes.ok) {
        console.error(`Strava club activities failed [${actRes.status}]: ${await actRes.text()}`);
      }

      const runs = activities.filter(
        (a) => a.sport_type === "Run" || a.sport_type === "TrailRun" || a.type === "Run",
      );
      const totalMiles = Math.round(
        runs.reduce((sum, a) => sum + (a.distance ?? 0) * M_TO_MI, 0),
      );

      // The club feed carries no timestamps, so the recent window is the feed's
      // most recent runs rather than a strict 7-day slice.
      const recentRuns: ClubRun[] = runs.slice(0, 6).map((a, i) => ({
        id: `c${i}`,
        name: a.name ?? "Club run",
        date: "",
        distanceMi: Number(((a.distance ?? 0) * M_TO_MI).toFixed(1)),
        runners: 1,
        elevationFt: a.total_elevation_gain
          ? Math.round(a.total_elevation_gain * M_TO_FT)
          : null,
      }));

      return {
        isSample: false,
        members: club.member_count ?? SAMPLE_CLUB_STATS.members,
        weeklyMiles: Math.round(
          runs.slice(0, 20).reduce((s, a) => s + (a.distance ?? 0) * M_TO_MI, 0),
        ),
        totalMiles,
        runsLogged: runs.length,
        longestStreakWeeks: SAMPLE_CLUB_STATS.longestStreakWeeks,
        recentRuns,
        fetchedAt: new Date().toISOString(),
        note: null,
      };
    } catch (err) {
      console.error("Club stats failed", err);
      return { ...SAMPLE_CLUB_STATS, note: "Couldn't reach Strava. Showing sample numbers." };
    }
  },
);
