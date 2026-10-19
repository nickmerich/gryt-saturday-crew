import {
  ageClubStats,
  STRAVA_CACHE_MS,
  STRAVA_CLUB_ID,
  UNAVAILABLE_CLUB_STATS,
  type ClubStats,
} from "../strava-club";

export type ClubTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};
export type Connection = {
  tokens: ClubTokens;
  stats: ClubStats | null;
};
export interface ClubStore {
  read(): Promise<Connection | null>;
  connect(tokens: ClubTokens, stats: ClubStats): Promise<void>;
  claimRefresh(id: string): Promise<boolean>;
  saveTokens(id: string, tokens: ClubTokens): Promise<void>;
  releaseRefresh(id: string): Promise<void>;
  saveStats(stats: ClubStats): Promise<void>;
}

export function createClubStatsService(options: {
  store: ClubStore;
  credentials: () => { clientId?: string; clientSecret?: string };
  fetch: typeof fetch;
  now?: () => number;
}) {
  const now = options.now ?? Date.now;
  let inFlight: Promise<ClubStats> | null = null;
  let retryAt = 0;

  async function tokenRequest(grant: Record<string, string>): Promise<ClubTokens> {
    const { clientId, clientSecret } = options.credentials();
    if (!clientId || !clientSecret)
      throw new Error("Strava application credentials are not configured.");
    const response = await options.fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, ...grant }),
      signal: AbortSignal.timeout(10_000),
    });
    // Never log or propagate response bodies: they can contain credentials.
    if (!response.ok) throw new Error("Strava authorization failed. Reconnect the club account.");
    const data = await response.json();
    if (
      typeof data.access_token !== "string" ||
      !data.access_token ||
      typeof data.refresh_token !== "string" ||
      !data.refresh_token ||
      !Number.isSafeInteger(data.expires_at) ||
      data.expires_at * 1000 <= now()
    )
      throw new Error("Strava returned an invalid authorization response.");
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    };
  }

  async function readCount(accessToken: string): Promise<ClubStats> {
    const response = await options.fetch(`https://www.strava.com/api/v3/clubs/${STRAVA_CLUB_ID}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Could not verify the Strava club.");
    const data = await response.json();
    if (
      data.id !== STRAVA_CLUB_ID ||
      !Number.isSafeInteger(data.member_count) ||
      data.member_count < 0
    ) {
      throw new Error("Strava did not return a valid GRYT member count.");
    }
    return {
      status: "live",
      members: data.member_count,
      fetchedAt: new Date(now()).toISOString(),
      note: null,
    };
  }

  function fallback(stats: ClubStats | null): ClubStats {
    return stats
      ? ageClubStats(
          { ...stats, status: "stale", note: "Last verified count. Refresh pending." },
          now(),
        )
      : { ...UNAVAILABLE_CLUB_STATS };
  }

  async function getInternal(): Promise<ClubStats> {
    let connection: Connection | null = null;
    try {
      connection = await options.store.read();
      if (!connection)
        return { ...UNAVAILABLE_CLUB_STATS, note: "Strava club connection is not active." };
      const at = connection.stats?.fetchedAt ? Date.parse(connection.stats.fetchedAt) : NaN;
      if (now() - at >= 0 && now() - at < STRAVA_CACHE_MS) {
        return ageClubStats(connection.stats!, now());
      }
      if (now() < retryAt) return fallback(connection.stats);
      let tokens = connection.tokens;
      if (tokens.expiresAt * 1000 <= now() + 60_000) {
        const lease = crypto.randomUUID();
        if (!(await options.store.claimRefresh(lease))) return fallback(connection.stats);
        try {
          // Another worker may have refreshed between the original read and lease.
          const latest = await options.store.read();
          if (!latest) throw new Error("Club connection unavailable.");
          tokens = latest.tokens;
          if (tokens.expiresAt * 1000 <= now() + 60_000) {
            tokens = await tokenRequest({
              grant_type: "refresh_token",
              refresh_token: tokens.refreshToken,
            });
            // Persist rotation BEFORE using the new access token.
            await options.store.saveTokens(lease, tokens);
          }
        } finally {
          await options.store.releaseRefresh(lease);
        }
      }
      const stats = await readCount(tokens.accessToken);
      await options.store.saveStats(stats);
      retryAt = 0;
      return stats;
    } catch {
      retryAt = now() + 60_000;
      return fallback(connection?.stats ?? null);
    }
  }

  return {
    get(): Promise<ClubStats> {
      if (!inFlight) {
        inFlight = getInternal().finally(() => {
          inFlight = null;
        });
      }
      return inFlight;
    },
    async connect(code: string): Promise<ClubStats> {
      const tokens = await tokenRequest({ grant_type: "authorization_code", code });
      const stats = await readCount(tokens.accessToken);
      await options.store.connect(tokens, stats);
      retryAt = 0;
      return stats;
    },
  };
}
