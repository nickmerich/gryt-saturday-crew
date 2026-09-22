# GRYT Hosted Staging Verification

## Current status

**The isolated Supabase project is created and its database/API-denial checks pass. Real organizer sign-in and authenticated app verification remain pending a staging-only server credential.**

This supersedes the environment-discovery block in the earlier [local staging report](./staging-verification-report.md). The production website and existing Supabase projects remain unchanged. The review branch has not been merged.

## Approved target

| Field | Value |
|---|---|
| Project | `gryt-attendance-staging` |
| Project ref | `ccyejgyootpqnhfblffi` |
| Organization | Merich Projects (`prlmntgfgderbxnudaer`) |
| Region | `us-east-2` |
| API endpoint | [Isolated staging API](https://ccyejgyootpqnhfblffi.supabase.co) |
| Provider status after creation | `ACTIVE_HEALTHY` |
| Provider creation quote approved by user | $0 per month |
| Data policy | Synthetic fixtures only; no production copy |

The user explicitly selected Merich Projects and approved creating the project at the quoted cost. That quote is not a guarantee that future upgrades, usage changes or provider pricing changes are free. No paid upgrade was requested.

The newly created public schema was confirmed empty before migration. The repository's existing `supabase/config.toml` was not repointed. Separate non-secret target metadata and an inactive environment template live in `staging/attendance.project.json` and `staging/attendance.env.example`.

## Migrations applied to staging only

Exact reviewed SQL files were read from the repository, not retyped or regenerated. The historical RSVP prerequisites were grouped into one staging migration; the three reviewed attendance migrations were applied individually.

| Hosted migration version | Name |
|---|---|
| `20260922070001` | `gryt_staging_rsvp_prerequisites` |
| `20260922070009` | `gryt_attendance_foundation` |
| `20260922070012` | `gryt_organizer_checkin` |
| `20260922070015` | `gryt_checkin_privilege_hardening` |

This is the attendance-related schema, not a full clone of every application feature. Unrelated commerce, member-profile, storage and waiver schemas were not copied merely to make an empty project resemble production.

## Hosted checks passed

### Catalog and privileges

All 26 conditions in `scripts/checkin-staging-preflight.sql` passed against the actual hosted database:

- All four ledger tables exist with row-level security enabled.
- Anonymous and ordinary authenticated roles have no direct ledger reads.
- Anonymous, authenticated and service roles have no direct ledger mutations.
- Both RPCs are security-definer with `search_path=public`, permit service-role execution and deny public-role execution.

Both functions are owned by `postgres`. This is an application permission boundary, not a claim that database owners cannot alter the data.

### Transactional synthetic database workflow

`scripts/checkin-hosted-staging-smoke.sql` ran against the hosted database under the real database roles. Its transaction tested:

- RSVP capture without inferred attendance.
- Check-in and idempotent retry without duplicate audit records.
- Stale-revision rejection.
- Normalized duplicate-name rejection for walk-ins.
- Walk-in capture and reasoned correction.
- Close, locked-write rejection and reopen.
- Preserved audit history and no extra jobs from attendance changes.
- Direct service-role audit mutation denied.
- Anonymous/member ledger access and direct member RSVP insertion denied.

All synthetic records were rolled back. Follow-up counts confirmed zero rows in `rsvps`, `attendance_jobs`, `checkin_sessions`, `checkin_entries`, `checkin_audit` and `checkin_requests`.

The actor UUIDs in this test were fixtures, not Supabase Auth sessions. This test does not prove real sign-in or independent-connection contention behavior.

### Public HTTPS API boundary

Five actual HTTPS requests used the staging publishable key, not a privileged credential. Each returned HTTP 401 with PostgreSQL permission code `42501`:

| Attempt | Result |
|---|---|
| Read `checkin_entries` | Denied |
| Read `checkin_audit` | Denied |
| Execute organizer read RPC | Denied |
| Execute organizer write RPC | Denied |
| Insert directly into `rsvps` | Denied |

No key value is included in this report or committed environment template.

## Security advisory review

The provider returned one informational advisory category, with six findings: RLS enabled without policies on `attendance_jobs`, `rsvp_requests` and the four check-in tables. These tables intentionally deny ordinary client access and use the reviewed server/RPC path. Adding permissive public policies to silence the notice would weaken the intended boundary; the meaning of this informational check is documented by [Supabase's RLS-enabled/no-policy guidance](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

No other security-advisor categories were returned in this check. This is a point-in-time result, not comprehensive application-security certification.

## Remaining work

- A staging-only server secret is needed for real Supabase Auth administration and privileged app requests. The connector exposes project management and publishable keys, not that server secret.
- A secure credential form was opened for `ccyejgyootpqnhfblffi.supabase.co`. Use this new project's secret API key, never the production key or organization token.
- No server secret has been stored in source, emitted in logs or placed in browser code.
- The running website review server is not yet wired to this hosted project. The environment example is a template, not proof of deployment.
- Real organizer, member, unconfirmed and expired-session behavior still needs testing through the application.
- Simultaneous writes from independent authenticated connections, hosted cookie/session restoration and supervised real-world headcount reconciliation remain release gates.
- Public event editing, outbound providers and automated workers remain outside this activation.

## Release decision

**Database staging is verified for the tested scope. Full application staging is not yet signed off.** Keep production unchanged and finish the authenticated end-to-end checks before considering a merge or release.
