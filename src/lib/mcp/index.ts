import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getRunSchedule from "./tools/get-run-schedule";
import getClubInfo from "./tools/get-club-info";

// The OAuth issuer MUST be the direct Supabase host, not the .lovable.cloud
// proxy — RFC 8414 issuer must match the discovery document exactly.
// `VITE_SUPABASE_PROJECT_ID` is inlined at build time. The fallback keeps the
// URL well-formed during the throwaway manifest-extract eval; the published
// build inlines the real ref and no token verifies against the sentinel.
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

// SDK-level OAuth: the MCP server verifies Supabase-issued bearer tokens on
// every request. Per-tool `guardToolAccess` (see ./public-allowlist.ts)
// remains as defense-in-depth: it lets the two intentionally-public
// discovery tools (`get_run_schedule`, `get_club_info`) respond to
// unauthenticated callers with an allowlisted field projection of info
// already published on grytrunclub.com, and blocks every other tool —
// current or future — unless a verified user token is present.
export default defineMcp({
  name: "gryt-run-club-mcp",
  title: "GRYT Run Club",
  version: "0.1.0",
  instructions:
    "Tools for GRYT Run Club, a Pittsburgh Saturday-morning run club. Use `get_run_schedule` for the weekly meet-up times and location, and `get_club_info` for mission, links, and how to join. Additional member-only tools require sign-in.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getRunSchedule, getClubInfo],
});
