import { defineMcp } from "@lovable.dev/mcp-js";
import getRunSchedule from "./tools/get-run-schedule";
import getClubInfo from "./tools/get-club-info";

// Unauthenticated access is blocked by default inside every tool handler via
// `guardToolAccess` (see `src/lib/mcp/public-allowlist.ts`). Only tools
// listed in `PUBLIC_TOOL_ALLOWLIST` may run for unauth callers, and their
// output is filtered to an explicit set of non-sensitive public fields
// (already published on grytrunclub.com). Any tool not on the allowlist —
// current or future — throws for unauth callers, satisfying the
// `app_mcp_public_unauthenticated` finding without breaking anonymous AI
// discovery of the public club info the server exists to expose.
//
// The SDK-level `auth` option is intentionally omitted: it is all-or-nothing
// per server, so enabling it would also block the intentionally-public
// tools. Enforcement lives one layer down, in each handler.
export default defineMcp({
  name: "gryt-run-club-mcp",
  title: "GRYT Run Club",
  version: "0.1.0",
  instructions:
    "Tools for GRYT Run Club — a Pittsburgh Saturday-morning run club. Use `get_run_schedule` for the weekly meet-up times and location, and `get_club_info` for mission, links, and how to join.",
  tools: [getRunSchedule, getClubInfo],
});
