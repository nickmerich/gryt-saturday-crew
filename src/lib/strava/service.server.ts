import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { STRAVA_CLUB_ID, type ClubStats } from "../strava-club";
import { createClubStatsService, type ClubStore, type ClubTokens } from "./stats-service";
import { seal, unseal } from "./crypto.server";

// Use the existing service-role client; no token-bearing table is client-readable.
const db = () => supabaseAdmin as unknown as SupabaseClient;
const secret = () => process.env.STRAVA_CLIENT_SECRET ?? "";
const table = "strava_club_connections";
const store: ClubStore = {
  async read() {
    const { data, error } = await db()
      .from(table)
      .select("encrypted_tokens,member_count,verified_at")
      .eq("club_id", STRAVA_CLUB_ID)
      .maybeSingle();
    if (error) throw new Error("Strava connection storage unavailable.");
    if (!data) return null;
    return {
      tokens: await unseal<ClubTokens>(data.encrypted_tokens, secret()),
      stats:
        data.verified_at == null
          ? null
          : {
              status: "live" as const,
              members: data.member_count,
              fetchedAt: data.verified_at,
              note: null,
            },
    };
  },
  async connect(tokens, stats) {
    const { error } = await db()
      .from(table)
      .upsert({
        club_id: STRAVA_CLUB_ID,
        encrypted_tokens: await seal(tokens, secret()),
        member_count: stats.members,
        verified_at: stats.fetchedAt,
        refresh_lease: null,
        refresh_lease_until: null,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error("Could not save the verified Strava connection.");
  },
  async claimRefresh(id) {
    const { data, error } = await db().rpc("claim_strava_club_refresh", {
      p_club_id: STRAVA_CLUB_ID,
      p_lease: id,
    });
    if (error) throw new Error("Could not lock Strava token refresh.");
    return data === true;
  },
  async saveTokens(id, tokens) {
    const { data, error } = await db()
      .from(table)
      .update({
        encrypted_tokens: await seal(tokens, secret()),
        updated_at: new Date().toISOString(),
      })
      .eq("club_id", STRAVA_CLUB_ID)
      .eq("refresh_lease", id)
      .select("club_id");
    if (error || data?.length !== 1)
      throw new Error("Could not persist rotated Strava credentials.");
  },
  async releaseRefresh(id) {
    const { error } = await db()
      .from(table)
      .update({ refresh_lease: null, refresh_lease_until: null })
      .eq("club_id", STRAVA_CLUB_ID)
      .eq("refresh_lease", id);
    if (error) throw new Error("Could not release Strava refresh lock.");
  },
  async saveStats(stats: ClubStats) {
    const { data, error } = await db()
      .from(table)
      .update({
        member_count: stats.members,
        verified_at: stats.fetchedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("club_id", STRAVA_CLUB_ID)
      .select("club_id");
    if (error || data?.length !== 1) throw new Error("Could not persist verified Strava count.");
  },
};
const service = createClubStatsService({
  store,
  credentials: () => ({
    clientId: process.env.STRAVA_CLIENT_ID,
    clientSecret: process.env.STRAVA_CLIENT_SECRET,
  }),
  fetch: (...args) => fetch(...args),
});
export const clubStatsService = () => service;
