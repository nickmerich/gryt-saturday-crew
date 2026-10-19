import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  createClubStatsService,
  type ClubStore,
  type Connection,
} from "../src/lib/strava/stats-service";
import {
  STRAVA_CLUB_ID,
  STRAVA_CACHE_MS,
  STRAVA_MAX_STALE_MS,
  ageClubStats,
  memberCountLabel,
} from "../src/lib/strava-club";
import { createOAuthState, verifyOAuthState, seal, unseal } from "../src/lib/strava/crypto.server";
import { stravaConnectConfig, stravaExchangeCode } from "../src/lib/strava/connect.server";

function fixture() {
  let clock = Date.parse("2026-10-19T12:00:00Z");
  let row: Connection | null = {
    tokens: {
      accessToken: "test-access",
      refreshToken: "test-refresh",
      expiresAt: clock / 1000 + 3600,
    },
    stats: null,
  };
  let lease: string | null = null;
  let failSave = false;
  const calls: string[] = [];
  const order: string[] = [];
  let answer: unknown = { id: STRAVA_CLUB_ID, member_count: 105 };
  let status = 200;
  let rotationStatus = 200;
  const store: ClubStore = {
    async read() {
      return row ? structuredClone(row) : null;
    },
    async connect(tokens, stats) {
      if (failSave) throw Error();
      row = { tokens, stats };
    },
    async claimRefresh(id) {
      if (lease) return false;
      lease = id;
      return true;
    },
    async saveTokens(id, tokens) {
      if (failSave || lease !== id) throw Error();
      order.push("persist rotation");
      row!.tokens = tokens;
    },
    async releaseRefresh(id) {
      if (lease === id) lease = null;
    },
    async saveStats(stats) {
      if (failSave) throw Error();
      row!.stats = stats;
    },
  };
  const fetcher = (async (url: string | URL | Request) => {
    const address = String(url);
    calls.push(address);
    if (address.endsWith("/oauth/token")) {
      return Response.json(
        {
          access_token: "rotated-access",
          refresh_token: "rotated-refresh",
          expires_at: clock / 1000 + 21_600,
        },
        { status: rotationStatus },
      );
    }
    order.push("read club");
    return Response.json(answer, { status });
  }) as typeof fetch;
  const create = () =>
    createClubStatsService({
      store,
      now: () => clock,
      fetch: fetcher,
      credentials: () => ({ clientId: "test", clientSecret: "test-secret" }),
    });
  return {
    service: create(),
    create,
    calls,
    order,
    store,
    get row() {
      return row;
    },
    disconnect() {
      row = null;
    },
    expireToken() {
      row!.tokens.expiresAt = clock / 1000 - 1;
    },
    advance(ms: number) {
      clock += ms;
    },
    setAnswer(value: unknown) {
      answer = value;
    },
    failUpstream(code = 503) {
      status = code;
    },
    failRotation() {
      rotationStatus = 401;
    },
    failStorage() {
      failSave = true;
    },
    lock() {
      lease = "another-worker";
    },
  };
}

describe("verified Strava membership", () => {
  test("valid zero is real data, not a missing count", async () => {
    const f = fixture();
    f.setAnswer({ id: STRAVA_CLUB_ID, member_count: 0 });
    expect(await f.service.get()).toMatchObject({ status: "live", members: 0 });
  });
  test("missing connection returns no count or sample", async () => {
    const f = fixture();
    f.disconnect();
    expect(await f.service.get()).toMatchObject({ status: "unavailable", members: null });
    expect(f.calls.length).toBe(0);
  });
  test.each([undefined, -1, 1.5, "105", null])(
    "invalid count %p never becomes verified",
    async (count) => {
      const f = fixture();
      f.setAnswer({ id: STRAVA_CLUB_ID, member_count: count });
      expect((await f.service.get()).members).toBeNull();
    },
  );
  test("wrong club rejected", async () => {
    const f = fixture();
    f.setAnswer({ id: 999, member_count: 105 });
    expect((await f.service.get()).status).toBe("unavailable");
  });
  test("request deduplication and persistent 15-minute cache", async () => {
    const f = fixture();
    const results = await Promise.all([f.service.get(), f.service.get(), f.service.get()]);
    expect(results.map((r) => r.members)).toEqual([105, 105, 105]);
    expect(f.calls.length).toBe(1);
    await f.create().get(); // Separate worker, same durable store.
    expect(f.calls.length).toBe(1);
    f.advance(STRAVA_CACHE_MS + 1);
    f.setAnswer({ id: STRAVA_CLUB_ID, member_count: 106 });
    expect((await f.service.get()).members).toBe(106);
    expect(f.calls.length).toBe(2);
  });
  test("failure preserves timestamp and explicitly marks stale", async () => {
    const f = fixture();
    const first = await f.service.get();
    f.advance(STRAVA_CACHE_MS + 1);
    f.failUpstream(429);
    expect(await f.service.get()).toMatchObject({
      status: "stale",
      members: 105,
      fetchedAt: first.fetchedAt,
    });
  });
  test("data older than 24 hours is hidden", async () => {
    const f = fixture();
    await f.service.get();
    f.advance(STRAVA_MAX_STALE_MS + 1);
    f.failUpstream();
    expect(await f.service.get()).toMatchObject({
      status: "unavailable",
      members: null,
      fetchedAt: null,
    });
  });
  test("rotated token is persisted before API read", async () => {
    const f = fixture();
    f.expireToken();
    expect((await f.service.get()).status).toBe("live");
    expect(f.row!.tokens.refreshToken).toBe("rotated-refresh");
    expect(f.order).toEqual(["persist rotation", "read club"]);
  });
  test("rotation persistence failure fails closed", async () => {
    const f = fixture();
    f.expireToken();
    f.failStorage();
    expect((await f.service.get()).members).toBeNull();
    expect(f.order).not.toContain("read club");
  });
  test("another worker's refresh lease prevents token rotation", async () => {
    const f = fixture();
    f.expireToken();
    f.lock();
    expect((await f.service.get()).members).toBeNull();
    expect(f.calls.length).toBe(0);
  });
  test("revoked token never yields samples", async () => {
    const f = fixture();
    f.expireToken();
    f.failRotation();
    expect((await f.service.get()).status).toBe("unavailable");
  });
  test("connect verifies club, persists credentials, returns only aggregate", async () => {
    const f = fixture();
    const result = await f.service.connect("example-code");
    expect(result.members).toBe(105);
    expect(JSON.stringify(result)).not.toContain("token");
    expect(f.row!.tokens.refreshToken).toBe("rotated-refresh");
  });
  test("connection is not reported successful if storage fails", async () => {
    const f = fixture();
    f.failStorage();
    await expect(f.service.connect("example-code")).rejects.toThrow();
  });
  test("client ages cached data even when fetching fails", () => {
    const at = Date.parse("2026-10-19T12:00:00Z");
    const data = {
      status: "live" as const,
      members: 105,
      fetchedAt: new Date(at).toISOString(),
      note: null,
    };
    expect(ageClubStats(data, at + STRAVA_CACHE_MS).status).toBe("stale");
    expect(memberCountLabel(ageClubStats(data, at + STRAVA_MAX_STALE_MS + 1))).toBe("...");
  });
});

describe("credential and authorization boundaries", () => {
  test("encrypted tokens round trip without plaintext", async () => {
    const encrypted = await seal({ refreshToken: "private-test-token" }, "test-secret");
    expect(encrypted).not.toContain("private-test-token");
    expect(await unseal(encrypted, "test-secret")).toEqual({ refreshToken: "private-test-token" });
    await expect(unseal(encrypted, "wrong-secret")).rejects.toThrow();
  });
  test("OAuth state is actor-bound, expiring and tamper-resistant", async () => {
    const at = Date.now();
    const state = await createOAuthState("admin@example.test", "test-secret", at);
    expect(await verifyOAuthState(state, "admin@example.test", "test-secret", at)).toBe(true);
    expect(await verifyOAuthState(state, "other@example.test", "test-secret", at)).toBe(false);
    expect(await verifyOAuthState(state, "admin@example.test", "test-secret", at + 600_001)).toBe(
      false,
    );
    expect(await verifyOAuthState(state + "x", "admin@example.test", "test-secret", at)).toBe(
      false,
    );
  });
  test("anonymous admin API calls fail before data access", async () => {
    expect(
      (await stravaConnectConfig(new Request("https://example.test/api/admin/strava-connect")))
        .status,
    ).toBe(403);
    expect(
      (
        await stravaExchangeCode(
          new Request("https://example.test/api/admin/strava-connect", { method: "POST" }),
        )
      ).status,
    ).toBe(403);
  });
  test("all public counters share the verified component, not static snapshots", () => {
    const index = readFileSync("src/routes/index.tsx", "utf8");
    const stats = readFileSync("src/components/site/ClubStats.tsx", "utf8");
    expect(index.match(/<StravaMemberCount/g)?.length).toBe(2);
    expect(stats.match(/<StravaMemberCount/g)?.length).toBe(1);
    expect(index + stats).not.toContain("STRAVA_MEMBERS_LABEL");
    expect(stats).not.toContain("LEADERS_WEEK");
    expect(stats).not.toContain("SAMPLE_CLUB_STATS");
  });
});
