import { createServerFn } from "@tanstack/react-start";

export const getStravaConfig = createServerFn({ method: "GET" }).handler(async () => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) throw new Error("Strava is not configured");
  return { clientId };
});

export const exchangeStravaCode = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string }) => {
    if (!input || typeof input.code !== "string" || input.code.length < 4 || input.code.length > 200) {
      throw new Error("Invalid code");
    }
    return { code: input.code };
  })
  .handler(async ({ data }) => {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error("Strava is not configured");

    const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: data.code,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Strava token exchange failed [${res.status}]: ${body}`);
      let parsed: { message?: string; errors?: Array<{ field?: string; code?: string }> } | null = null;
      try { parsed = JSON.parse(body); } catch { /* not JSON */ }
      const codes = (parsed?.errors ?? []).map((e) => `${e.field ?? ""}:${e.code ?? ""}`).join(",");
      if (res.status === 400 && /redirect_uri/i.test(body)) {
        throw new Error(
          "Strava rejected the redirect URL. In your Strava API app settings, set the Authorization Callback Domain to this site's domain (no https://, no path).",
        );
      }
      if (res.status === 401 || /invalid|unauthor/i.test(body)) {
        throw new Error(
          "Strava rejected the authorization code. This usually means the client ID/secret don't match, or the code was already used. Try Connect Strava again.",
        );
      }
      throw new Error(
        `Couldn't connect to Strava (${res.status}${codes ? ` · ${codes}` : ""}). Please try again.`,
      );
    }

    const json = (await res.json()) as {
      access_token: string;
      expires_at: number;
      athlete?: { firstname?: string; lastname?: string; username?: string };
    };
    return {
      accessToken: json.access_token,
      expiresAt: json.expires_at,
      athlete: json.athlete
        ? {
            firstName: json.athlete.firstname ?? null,
            username: json.athlete.username ?? null,
          }
        : null,
    };
  });

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number; // meters
  moving_time: number; // seconds
  start_date_local: string; // ISO
  location_city: string | null;
  location_state: string | null;
};

export const getStravaActivities = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string }) => {
    if (!input || typeof input.accessToken !== "string" || input.accessToken.length < 8) {
      throw new Error("Missing access token");
    }
    return { accessToken: input.accessToken };
  })
  .handler(async ({ data }) => {
    const res = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=30",
      { headers: { Authorization: `Bearer ${data.accessToken}` } },
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`Strava activities fetch failed [${res.status}]: ${body}`);
      if (res.status === 401) throw new Error("Your Strava session expired. Reconnect to continue.");
      throw new Error("Couldn't load your Strava runs. Please try again.");
    }
    const all = (await res.json()) as StravaActivity[];
    const runs = all.filter(
      (a) => a.sport_type === "Run" || a.sport_type === "TrailRun" || a.type === "Run",
    );
    return { activities: runs.slice(0, 20) };
  });
