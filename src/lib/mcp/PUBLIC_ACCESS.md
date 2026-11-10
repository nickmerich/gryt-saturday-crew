# MCP Public Access Policy

This document describes which tools on the GRYT Run Club MCP server (`/mcp`)
are reachable **without authentication**, which response fields are exposed
to anonymous callers, and the reasoning behind each decision.

Source of truth for enforcement: [`src/lib/mcp/public-allowlist.ts`](./public-allowlist.ts).
Any change to what unauthenticated callers can see MUST be made there — this
document mirrors that file.

## Design principle

The GRYT MCP server exists so AI assistants (ChatGPT, Claude, Cursor, etc.)
can answer questions like "when does GRYT Run Club meet?" or "how do I join?"
on behalf of anonymous users. Requiring OAuth for every call would defeat
that purpose.

To satisfy the `app_mcp_public_unauthenticated` security scan requirement
without breaking anonymous discovery, access control is enforced **per tool
handler** via `guardToolAccess()` rather than at the SDK level (which is
all-or-nothing per server). The rules:

1. **Default deny.** Any tool not explicitly listed below throws
   `Unauthorized` for unauthenticated callers.
2. **Field allowlist.** For allowlisted tools, unauth responses are filtered
   to a fixed set of field names. Fields not on the list are stripped —
   even if a future edit adds new data to the handler's return value.
3. **Public-only data.** Allowlisted fields must contain information that
   is already publicly published on [grytrunclub.com](https://grytrunclub.com).
   No PII, member data, RSVPs, waivers, admin state, or internal ops.
4. **Authenticated callers** (verified via `ctx.isAuthenticated()`) get the
   full, unfiltered response.

## Allowlisted tools

### `get_run_schedule`

**Why public:** The weekly Saturday meet-up time and location are the club's
primary public-facing information, printed on flyers and the homepage hero.
An AI that can't answer "when does GRYT run?" is useless for discovery.

**Allowed fields (unauth):**

| Field          | Contains                                          |
| -------------- | ------------------------------------------------- |
| `day`          | Day of week (e.g. "Saturday")                     |
| `time`         | Meet-up time (e.g. "7:00 AM")                     |
| `location`     | General route area                                |
| `meetingPoint` | Street address of the meet-up (already on homepage) |
| `pace`         | Pace description                                  |
| `notes`        | Public notes ("coffee after", "no membership")    |
| `runs`         | Array wrapper of the above per scheduled run      |

### `get_club_info`

**Why public:** Mirrors the marketing copy on the landing page. This is the
information the club actively wants indexed and shared by AI assistants.

**Allowed fields (unauth):**

| Field         | Contains                                     |
| ------------- | -------------------------------------------- |
| `name`        | "GRYT Run Club"                              |
| `mission`     | Public tagline                               |
| `description` | Public description                           |
| `location`    | Neighborhood / city                          |
| `website`     | https://grytrunclub.com                      |
| `strava`      | Public Strava club URL                       |
| `instagram`   | Public Instagram handle                      |
| `howToJoin`   | Public RSVP and show-up instructions         |

## Explicitly NOT public

The following categories of data must **never** be added to the allowlist,
even if a new tool is created to expose them. Tools that return this data
must require `ctx.isAuthenticated()` and — where appropriate — an additional
role check.

- Member records, profiles, or contact info (email, phone, address beyond the public meet-up address)
- RSVP lists or attendance history
- Waiver signatures, waiver status, or minor/guardian data
- Newsletter subscriber lists
- Notion member sync data
- Partner inquiries, story submissions, recommendations
- Admin allowlist membership
- Any Supabase row that has RLS restricting it to `authenticated` or a role
- Internal analytics, feature flags, or ops signals

## Adding a new tool

1. Decide: does this tool return **only** data already published on the public
   website? If no → do **not** add it to `PUBLIC_TOOL_ALLOWLIST`. Gate it
   with `if (!ctx.isAuthenticated()) throw ...` in the handler.
2. If yes → add an entry to `PUBLIC_TOOL_ALLOWLIST` with the exact field
   names the handler returns in `structuredContent`. Call `guardToolAccess`
   in the handler as the last step before returning.
3. Update this document with the new tool and its rationale.
4. Run `app_mcp_server--extract_mcp_manifest` to refresh the connector catalog.

## Auditing

To verify the current policy matches the code:

```bash
rg "guardToolAccess" src/lib/mcp/tools/    # every tool file should appear
```

Every file under `src/lib/mcp/tools/` MUST call `guardToolAccess`. A tool
handler that skips this call is a bug — it either leaks data (if the tool is
sensitive) or 500s for unauth callers (if it isn't).
