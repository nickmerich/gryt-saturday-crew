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
      let parsed: { message?: string; errors?: Array<{ resource?: string; field?: string; code?: string }> } | null = null;
      try { parsed = JSON.parse(body); } catch { /* not JSON */ }
      const errs = parsed?.errors ?? [];
      const codes = errs.map((e) => `${e.resource ?? ""}.${e.field ?a ""}:${e.code ?? ""}`).filter((s) => s !== "..:").join(", ");
      const tag = `[strava ${res.status}${codes ? ` · ${codes}` : ""}]`;

      // invalid_grant / expired / already-used authorization code
      const hasField = (field: string, code?: string) =>
        errs.some((e) => e.field === field && (!code || e.code === code));
      if (hasField("code", "invalid") || /invalid_grant/i.test(body)) {
        throw new Error(
          `${tag} Authorization code was rejected (invalid_grant). Strava codes expire within seconds and can only be used once — this usually means the page was refreshed after redirect, the code was re-exchanged, or too much time passed. Tap Connect Strava to start a fresh authorization.`,
        );
      }
      if (hasField("code", "expired") || /expired/i.test(body)) {
        throw new Error(
          `${tag} Authorization code expired before it reached Strava. Tap Connect Strava again and complete the authorization within ~30 seconds.`,
        );
      }
      if (hasField("client_id") || hasField("client_secret") || /client.?(id|secret)/i.test(body)) {
        throw new Error(
          `${tag} Strava rejected the client credentials. The STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET on the server doesn't match your Strava API application. Site owner: verify both secrets in the Strava API settings.`,
        );
      }
      if (res.status === 400 && /redirect_uri/i.test(body)) {
        throw new Error(
          `${tag} Strava rejected the redirect URL. In your Strava API app settings, set the Authorization Callback Domain to this site's domain (no https://, no path).`,
        );
      }
      if (res.status === 429) {
        throw new Error(`${tag} Strava rate limit hit. Wait 15 minutes and try again.`);
      }
      if (res.status >= 500) {
        throw new Error(`${tag} Strava is having trouble on their end. Try again in a minute.`);
      }
      if (res.status === 401 || /unauthor/i.test(body)) {
        throw new Error(
          `${tag} Strava rejected the request as unauthorized. The client ID/secret likely don't match, or the code was already used. Tap Connect Strava again.`,
        );
      }
      throw new Error(
        `${tag} Couldn't complete Strava token exchange. ${parsed?.message ?? "Please try again."}`,
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
