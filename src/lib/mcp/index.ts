import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getRunSchedule from "./tools/get-run-schedule";
import getClubInfo from "./tools/get-club-info";

// Supabase Auth is the OAuth 2.1 authorization server for this MCP resource.
// The SDK validates bearer JWTs; tools additionally consult
// `src/lib/mcp/public-allowlist.ts` to decide whether an unauth caller may
// receive a filtered public-fields response, or must be rejected.
//
// Fixes security finding `app_mcp_public_unauthenticated`: the server now
// requires OAuth by default, and only explicitly-allowlisted public,
// non-sensitive fields are ever returned to unauthenticated callers.
const supabaseUrl =
  process.env.SUPABASE_URL ?? "https://supabase.invalid/auth/v1";

export default defineMcp({
  name: "gryt-run-club-mcp",
  title: "GRYT Run Club",
  version: "0.1.0",
  instructions:
    "Tools for GRYT Run Club — a Pittsburgh Saturday-morning run club. Use `get_run_schedule` for the weekly meet-up times and location, and `get_club_info` for mission, links, and how to join.",
  tools: [getRunSchedule, getClubInfo],
  auth: auth.oauth.issuer({
    issuer: `${supabaseUrl.replace(/\/+$/, "")}/auth/v1`,
    acceptedAudiences: "authenticated",
    jwksUri: `${supabaseUrl.replace(/\/+$/, "")}/auth/v1/.well-known/jwks.json`,
  }),
});
