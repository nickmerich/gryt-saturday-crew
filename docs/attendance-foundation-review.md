# GRYT Attendance Foundation Review

## Review status

Implemented for review in `review/attendance-foundation-2026-09-22`, based on `d6b478a67f19e003641a00d7b174cd84b37454f4`. This is not a production release. No production migration, scheduler, email, Notion write, member import, payment, merge, or live-site deployment was performed.

The branch establishes the RSVP reliability foundation, not a new attendance system. Actual attendance still requires explicit organizer evidence in the existing operational process. An RSVP, Strava activity, email acceptance, or waiver signature never creates a check-in.

During implementation, upstream `main` independently advanced to `3f8759e` with weather, route and club-stat additions. This task did not make those changes. GitHub reports this draft branch as mergeable, but the tests below cover the original review-branch baseline, not a combined build with those newer additions. Reconcile and retest against current `main` before approval; no upstream history was rewritten or overwritten.

## Implemented

- **Canonical event occurrence:** Full local dates, stable event IDs and versions, New York timezone conversion, consistent current-run details, Google Calendar URLs and UTC-correct ICS. Today's directions remain available while the run is in progress.
- **Reviewed exceptions:** Cancelled, modified and unconfirmed states in `RUN_OVERRIDES`, with notices, RSVP gating and stale-confirmation blocking. Event changes are source-controlled, not public writes.
- **Atomic capture:** A database transaction records one logical RSVP, idempotency receipts and downstream jobs. Matching uses normalized contact plus name plus event, not name alone. Retried payloads cannot create duplicate jobs.
- **Honest confirmation:** A saved RSVP is distinct from queued email, provider acceptance, suppression and failure. Phone capture does not promise automated text reminders. Restored older sessions with no job evidence show unconfirmed delivery.
- **Recoverable delivery:** Durable email, owner-notification and Notion jobs, bounded attempts, backoff, claim tokens, lease recovery and explicit manual-review states for uncertain external side effects.
- **Private operations:** Existing confirmed-email admin allowlist protects the queue. The worker token can process but cannot read the operator queue. Public clients cannot write directly to the new job/receipt tables or call privileged RPCs.
- **Identity safety:** Notion no longer matches by name alone or assigns first-timer lifecycle from an RSVP. Shared-name, shared-contact ambiguity and phone-only Notion matching require review. Roster grouping uses normalized name and contact.
- **Waiver continuity:** Existing form, legal language and signature storage remain intact. Automatic waiver linkage requires exact name/email, current season and current version. A missing match means review, not proof that the person never signed.
- **Mobile entry:** Current-run summary, fixed mobile RSVP/details action, labelled form controls and 375px calendar support. Inputs and action buttons wait for hydration; the shared footer now wraps instead of overflowing.
- **Measurement:** Conversion events fire for newly persisted receipts, not duplicate returns. Captured attribution is constrained and referrer reduced to hostname; contacts are not added to analytics events.

## Scope differences and open release gates

This review branch does not satisfy every production acceptance gate in the PRD yet. The distinctions below are intentional and must remain visible in review.

| PRD area | Branch implementation | Remaining gate |
|---|---|---|
| R01–R03 event consistency/status | Shared model, reviewed source overrides, elapsed-time completion notices | No organizer status editor; no explicit persisted `completed` state. Confirm source-controlled exceptions are acceptable for this release or build an admin editor before calling those criteria complete. |
| R04–R06 capture, messaging, waiver | Implemented with isolated tests and synthetic browser receipts | Exercise real staging database, cookie restoration, unsigned/expired/version-changed waiver and approved test inboxes. |
| R07 actual attendance | No automatic attendance or first-timer inference | No new check-in ledger or backfill. Perform one supervised real-run reconciliation after separate approval. |
| R08–R10 privacy/recovery/identity | Server allowlist, private tables, durable jobs, conservative matching | Test admin sign-in, destination permissions, suppression and external result uncertainty in staging. |
| R11 mobile | Tested at 375px; desktop reviewed | Existing Lovable asset endpoints and third-party embeds need deployed-platform visual review. |
| R12 measurement | Idempotent persistence and new-record-only conversion | Verify actual analytics event collection and reporting with approved staging tooling. |

Existing calendar downloads are snapshots, not subscriptions. A later cancellation does not silently update an imported calendar. No cancellation broadcast was added or sent.

The homepage has existing brand/copy experiments outside this phase. They were preserved rather than replaced. This branch does not activate weather, maps, SMS, commerce changes, Strava activity ingestion or newsletter enrollment.

## Verification performed

- `npm run typecheck`: passed.
- Production Vite build: passed in a credential-free copy using Node 22.
- Attendance unit/API/isolated Postgres tests: 14 passed. Includes migration reapplication, idempotency conflict and duplicate capture, shared contact identities, job leasing and expired lease review, anonymous SQL denial, DST, calendar dates, stale-event rejection, storage failure and non-admin API denial.
- Existing inquiry-schema tests: 8 passed.
- Existing Bun public-MCP and email-recipient tests: 17 passed.
- Local Playwright attendance tests: 3 passed. Browser response fixtures test missing inputs, storage failure without false success, stable retry keys, phone confirmation, reset, month navigation and mobile overflow.
- New attendance modules, canonical event model, identity helper, queue component and calendar targeted lint: passed.
- `git diff --check`: passed.

The isolated Postgres test uses PGlite, not the production Supabase environment. Browser success receipts are explicitly synthetic; the preview database and providers are disconnected. These tests do not prove email delivery, deployed Supabase policy behavior, real Notion writes, or a supervised attendance reconciliation.

Repository-wide lint was already failing at the base commit with 3,670 findings. This branch does not claim a clean global lint run or undertake unrelated site-wide formatting. Existing Strava embeds also raised third-party script errors during local visual inspection.

## Review the changes

Start with the migration and `src/lib/attendance/capture.server.ts`, then the job processor, Notion reconciliation and protected queue. Review `src/lib/run-occurrence.ts` alongside the homepage and calendar before approving event logistics.

Two new development-only packages support the tests: `tsx` and `@electric-sql/pglite`. No runtime package was added. The npm lockfile was already out of sync with the base package manifest, so both existing npm and Bun locks were refreshed. Dependency changes are committed separately for review.

## Staging activation checklist

1. Create or select an isolated staging Supabase project and approved test destinations. Do not point a branch preview at production secrets by default.
2. Review and apply `supabase/migrations/20260922050000_attendance_foundation.sql` to staging only. It adds columns/tables/RPCs and revokes direct public RSVP inserts; the validated server remains the write boundary.
3. Deploy the branch server and client to staging together. Generated Supabase types may be refreshed from the staging schema; runtime adapters currently use an explicit generic client for the new tables.
4. Confirm current run logistics and any exceptions. Edit the full-date `RUN_OVERRIDES` entry and increment its version whenever status, time, location or route changes.
5. Configure only staging email/Notion credentials and approved test recipients. Validate existing sender registry, suppression handling and Notion property names/permissions before processing jobs.
6. Test one new RSVP, the same retry, a second request key for the same person/event, two people sharing a contact, and a changed-event retry. Confirm one logical RSVP and one job per kind.
7. Test ordinary/unsigned-in access, confirmed admin access, waiver continuation and exact-name mismatch review. Do not infer “unsigned” solely from an unmatched legal name.
8. Reconcile provider and Notion results. An accepted email is not delivered. An uncertain external create/send moves to `needs_review`; inspect the destination before any manual resolution.
9. Choose manual processing or approve a scheduler. No scheduler is installed or enabled by this branch. The private roster offers a confirmation-gated “Process up to five jobs” action.
10. Before unattended processing, add or verify perimeter abuse controls and monitoring. The transaction includes per-contact limits and the request has bounded validation, but these are not a global IP-based rate limiter or CAPTCHA.
11. Obtain production release approval separately, then run a supervised event reconciliation. Do not merge simply because local tests pass.

### Worker contract

Configure a random `ATTENDANCE_JOB_TOKEN` of at least 32 characters in server-only staging secrets. An approved scheduler can POST JSON `{"action":"process"}` to `/api/admin/attendance` with `Content-Type: application/json` and `x-attendance-job-token`. Each invocation attempts up to five jobs; the database serializes claims and gives them a five-minute lease.

Never put the token in browser code, URLs, source control, documentation or logs. Select scheduler frequency and runtime timeout to fit the deployed platform. Validate the worker on that platform before enabling unattended processing.

Only failed jobs with reviewed external state can be requeued through the admin UI. `needs_review` jobs have no blind-retry action. Resolve them by matching the RSVP/job IDs to provider or Notion evidence, preserving the audit trail and using an authorized corrective procedure.

### Event changes and identity review

A previous RSVP is retained with its saved event snapshot. If the same person RSVPs again after an event version changes, the server asks for organizer review instead of silently replacing the receipt or resending old details. Plan the approved communication to affected runners separately.

Phone-only Notion matching is deliberately manual until a verified phone-property mapping is approved. First-name RSVP versus full legal-name waiver may also require human reconciliation. Do not “fix” these exceptions with name-only joins.

## Rollback

Stop any separately configured worker first. Restore the prior application code through a normal reviewed deployment, without deleting existing RSVP or waiver records. The prior server uses the service role, so public direct-insert permission does not need to be restored as a shortcut.

Keep the additive tables, receipts, jobs and snapshots for audit and controlled reconciliation. Do not run a destructive down migration or bulk replay. Verify whether a provider action already happened before resuming any queued work.

## Change log

- **Saved:** Source code, migration, tests and this review runbook.
- **Tested:** Isolated database, local API/unit checks, synthetic browser flow, typecheck and credential-free build.
- **Queued for review:** Branch, draft PR and private disconnected preview.
- **Not activated:** Production schema, external worker, provider sends/sync, live website and real attendance reconciliation.
