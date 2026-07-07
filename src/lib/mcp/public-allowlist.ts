// Explicit allowlist of tools and per-tool response fields that are safe to
// return WITHOUT authentication. Anything not listed here MUST require a
// verified OAuth caller (`ctx.isAuthenticated()`), and any tool output field
// not in `fields` is stripped from unauth responses.
//
// This is defense-in-depth for the MCP server: even though the server is
// configured with OAuth (see src/lib/mcp/index.ts), the allowlist ensures
// that if the auth layer is ever relaxed, only explicitly-marked public,
// non-sensitive fields can leak — never PII, member data, RSVPs, waivers,
// or admin surfaces.
//
// Fix for security finding: app_mcp_public_unauthenticated.

export type PublicToolPolicy = {
  /** Field names permitted in the tool's `structuredContent` for unauth callers. */
  fields: readonly string[];
};

export const PUBLIC_TOOL_ALLOWLIST: Readonly<Record<string, PublicToolPolicy>> = {
  get_run_schedule: {
    // Weekly meet-up info — already published on the public homepage.
    fields: ["day", "time", "location", "meetingPoint", "pace", "notes", "runs"],
  },
  get_club_info: {
    // Public marketing info — mirrors grytrunclub.com landing content.
    fields: [
      "name",
      "mission",
      "description",
      "location",
      "website",
      "strava",
      "instagram",
      "howToJoin",
    ],
  },
};

export function isPublicTool(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(PUBLIC_TOOL_ALLOWLIST, name);
}

/** Strip any field not on the tool's public allowlist. Recurses into arrays. */
export function filterToPublicFields<T>(toolName: string, value: T): T {
  const policy = PUBLIC_TOOL_ALLOWLIST[toolName];
  if (!policy) return value;
  const allowed = new Set(policy.fields);
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (allowed.has(k)) out[k] = walk(val);
      }
      return out;
    }
    return v;
  };
  return walk(value) as T;
}

/**
 * Gate a tool call. Authenticated callers get full data. Unauthenticated
 * callers only reach tools present in PUBLIC_TOOL_ALLOWLIST, and their
 * response is filtered to the allowlisted fields. Non-allowlisted tools
 * throw for unauth callers — this is the block for the
 * `app_mcp_public_unauthenticated` finding.
 */
export function guardToolAccess<T>(
  toolName: string,
  isAuthenticated: boolean,
  payload: T,
): T {
  if (isAuthenticated) return payload;
  if (!isPublicTool(toolName)) {
    throw new Error(
      `Unauthorized: tool "${toolName}" requires authentication. ` +
        `Only allowlisted public tools may be called anonymously.`,
    );
  }
  return filterToPublicFields(toolName, payload);
}
