
# GRYT Notion-as-Source-of-Truth

Notion holds the canonical member + attendance records. The website is a thin client that writes through to Notion via server functions. No second CRM in Supabase.

## 1. Notion databases (I create fresh)

I'll pick a sensible parent (a new top-level page called **"GRYT Ops"** in your Notion workspace) and create two linked databases.

### A. GRYT Members
Properties match your spec exactly:
- Name (title), Email, Phone, Strava Handle, Instagram Handle
- First Run Date, Last Run Date, Total Runs (number)
- Lifecycle State (select: Prospect, First-Timer, Regular, Bringer, Anchor, Drifter, Paused, Archived)
- Last Contacted (date), Outreach Status (select: Not contacted, Invite needed, Invited, Follow-up needed, Replied, Coming Saturday, Not now, Do not contact), Outreach Channel (select: SMS, IG DM, Email, In person, Strava)
- Brought By (relation → Members, self), Friends Brought (rollup count of reverse relation)
- Notes (rich text), Source (select: Website RSVP, Manual, Strava, Photo, Referral)
- Waiver Status (select: Not signed, 2026 Signed, Expired)
- RSVP History (relation → Attendance)
- Created At, Updated At

### B. GRYT Attendance
- Run Date (title or date+formula title like "2026-06-27 #43")
- Run Number, Route, Location, Weather Note
- Member (relation → Members)
- Attendance Status (select: RSVP, Attended, No-show, Maybe)
- First Timer (checkbox), Brought By (relation → Members)
- Notes, Source (select: Website RSVP, Manual, Strava, Photo review)

### Notion views I'll create
- **This Saturday RSVPs** (Attendance, filter: Run Date = next Saturday, Status = RSVP)
- **Drifter Outreach** (Members, filter per spec §6)
- **First-Timers (last 30d)**, **Bringers**, **Near-Anchor**, **Missing data**, **Recent outreach**

I share both DB URLs back in chat after creation.

## 2. Website → Notion sync (direct server-side writes)

All Notion access goes through Notion connector gateway from `createServerFn` handlers. No Supabase mirror of member/attendance data.

### `rsvpForSaturday` server fn
Input: `{ name, email?, phone?, strava?, instagram?, runDate }`

1. Query Members DB filtered by email OR phone OR strava OR instagram OR (name + no other match).
2. If match → update that member. If none → create with Lifecycle State = Prospect, Source = Website RSVP.
3. Upsert an Attendance row for `runDate` + member, Status = RSVP, Source = Website RSVP.
4. Set member Outreach Status = "Coming Saturday", Updated At = now.

Existing `rsvps` Supabase table: keep as a write-through audit log only (already there from waiver flow). Mark each row `notion_synced bool` + `notion_page_id`. If Notion write fails, row stays `notion_synced=false` and surfaces in the admin "Missing data" view.

### Waiver flow
On successful waiver signature, also call the same upsert path with Waiver Status = "2026 Signed".

## 3. Admin dashboard (`/admin`)

Gated by **email allowlist** in a server fn middleware (`ADMIN_EMAILS` env var = "nick@…,laura@…"). Uses existing Supabase auth + `requireSupabaseAuth`; middleware checks `context.claims.email` ∈ allowlist or throws 403. Route lives under `src/routes/_authenticated/admin/`.

Sections (each one = one server fn reading Notion live):
1. **This Saturday RSVPs** — list from Attendance.
2. **First-timers to welcome** — Lifecycle = First-Timer.
3. **Drifters to check in on** — per §6 filter.
4. **Regulars close to becoming Anchor** — Regulars with 4–5 runs in 90d.
5. **Bringers to recognize** — Friends Brought ≥ 1 in last 30d.
6. **Missing data to clean up** — members with no email+phone, unsynced RSVPs.
7. **Recent outreach sent** — Last Contacted in last 14d.

### Post-run update workflow (`/admin/run/:date`)
- Pick run date → loads RSVP list + recent regulars.
- Checkboxes: Attended / No-show / Maybe / Add first-timer.
- Inline "Brought by" picker (Member search).
- Notes field per run.
- Submit → batch update Attendance rows + recompute member Last Run / Total Runs / Lifecycle State server-side (Notion writes).

### Outreach logger (`/admin/outreach/:memberId`)
Form: Date, Channel, Message summary, Outreach Status, Next follow-up, Owner. Writes to member + appends a row to a small **Outreach Log** Notion DB (3rd DB) for history. **No drafting, no auto-send.**

## 4. Lifecycle recompute (server fn, deterministic)

Pure function `computeLifecycle(member, attendance[])` applied:
- After post-run update
- After RSVP if member moved to a new bucket
- On demand via "Recompute all" admin button

Rules from §5 implemented exactly. Skips members where Lifecycle = Paused or Archived.

## 5. Constraints honored

- Notion is canonical. Supabase only holds: auth users, waiver signatures (legal), RSVP audit log w/ `notion_synced` flag.
- Every Notion write logged; failures bubble to "Missing data".
- No emoji, brand-correct copy in admin UI (lowercase headings, condensed display for section titles, baby blue accents).

## Technical notes

- Notion API via gateway: `https://connector-gateway.lovable.dev/notion/v1/...` with `Authorization: Bearer $LOVABLE_API_KEY` + `X-Connection-Api-Key: $NOTION_API_KEY`. Notion connector already linked (MCP confirms).
- New env var: `ADMIN_EMAILS` (comma-separated). I'll request via `add_secret` after approval.
- New files: `src/lib/notion/{client,members,attendance,lifecycle}.server.ts`, `src/lib/notion/*.functions.ts`, `src/routes/_authenticated/admin/*`, `src/integrations/admin-middleware.ts`.
- Supabase migration: add `notion_synced bool default false`, `notion_page_id text`, `notion_last_error text` to `rsvps`. No new tables.
- Database IDs captured at creation time and stored as env vars (`NOTION_MEMBERS_DB_ID`, `NOTION_ATTENDANCE_DB_ID`, `NOTION_OUTREACH_DB_ID`) via `add_secret`.

## Out of scope (call out explicitly)

- Strava OAuth ingestion (manual entry only for now).
- Photo OCR / auto attendance from images.
- Automated message sending (logging only).
- SMS/email outreach delivery infra.

## Build order

1. Create the 3 Notion DBs + views; capture IDs.
2. Add env vars + admin middleware.
3. Notion client + members/attendance helpers + lifecycle calc.
4. Wire website RSVP form to new `rsvpForSaturday` server fn; migrate `rsvps` table.
5. Admin dashboard + post-run workflow + outreach logger.
6. Backfill any existing `rsvps` rows into Notion (one-shot script).
