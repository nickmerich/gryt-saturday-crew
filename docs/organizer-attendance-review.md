# GRYT Organizer Attendance Review

## Review-only implementation

The organizer desk lives at `/admin/check-in` and is linked from the existing private RSVP roster. It extends the attendance foundation without replacing authentication, public RSVP, waivers, messaging jobs or Notion records. It remains on `review/attendance-foundation-2026-09-22` in [PR 15](https://github.com/nickmerich/gryt-saturday-crew/pull/15).

The migration is authored, not applied to Supabase. No member messages, live records, provider jobs or production deployments are part of this work.

## Operator workflow

- **Choose the run:** Select a Saturday date. Confirm the reviewed schedule, location and route. The default is the next canonical run; historical schedule defaults are not proof that an event happened.
- **Find the person:** Search by name or masked contact hint and filter everyone, checked-in runners, not-recorded runners or walk-ins. Full contact details are not returned to this browser view.
- **Check in:** Record a person individually after observing their presence. An RSVP alone never creates attendance.
- **Add a walk-in:** Search first, then provide a name. This records attendance, not a membership, contact subscription or waiver. Matching names trigger a conflict unless the organizer explicitly confirms a different person.
- **Correct a check-in:** Supply a short operational reason. The person returns to Not recorded, while the previous check-in remains in the audit trail.
- **Close attendance:** After the scheduled run end, review totals and provide a reason. Closing locks edits without converting unrecorded people into no-shows.
- **Reopen:** Review and explain why a correction is needed. Reopening and subsequent corrections are audited.
- **Review changes:** The latest 50 changes show the actor, timestamp, action and reason. Older audit records remain in the private database.

Check-in is not waiver clearance. Organizers must review waivers using the existing roster and established run-day process. Same-name records are not identity matches, and walk-ins are not automatically merged into cross-run member profiles.

## Data and security

The additive migration `20260922070000_organizer_checkin.sql` introduces four private tables:

| Table | Purpose |
|---|---|
| `checkin_sessions` | Immutable event snapshot, current revision and attendance closed/open state |
| `checkin_entries` | Event-specific presence, linked RSVP where available, or named walk-in |
| `checkin_audit` | Append-only application audit with actor, prior state, new state and reason |
| `checkin_requests` | Idempotent mutation receipts |

The API requires a bearer session verified by Supabase and a confirmed email in the existing organizer allowlist. A worker token cannot use this endpoint. No allowlist entries were added. Responses use `Cache-Control: no-store`, and the page is excluded from indexing.

Anonymous and ordinary authenticated roles cannot read the ledger or execute its functions. The service role uses narrowly scoped security-definer functions; direct application writes to the audit table are not granted. Database owners remain privileged, so this is not a cryptographically tamper-proof audit.

A mutation takes a request lock and an event lock, checks the event snapshot and expected revision, then commits the attendance change, audit entry and idempotency receipt together. Two organizers cannot silently overwrite the same revision. Retrying the same request does not create an extra check-in or audit entry.

The browser never marks a save successful before server confirmation. An uncertain save disables new mutations and offers the identical request as a retry. The organizer can instead discard the retry and reload to reconcile the roster. A failed roster refresh removes active roster controls rather than presenting old data as current.

## Boundaries and honest limits

- This is an explicit, event-specific attendance ledger, not a member identity system or retention dashboard.
- Only RSVPs with a canonical `event_id` appear for that event. Legacy label-only RSVP records require manual review; they are never silently assigned to dates.
- Check-in opens one hour before the confirmed start and remains available for retrospective organizer reconciliation. Cancelled and unconfirmed events cannot receive check-ins.
- The public run's status is not changed by closing attendance. Public schedule exceptions still use reviewed source changes.
- A saved session whose event snapshot differs from the current reviewed schedule is blocked for reconciliation. There is no automatic snapshot replacement or public event editor.
- The board is refresh-based, not realtime. It shows a last-loaded time. The server revision fence remains authoritative.
- No offline writes are queued. Poor reception produces an uncertain or failed state, not a successful-looking local check-in.
- No contact export, bulk no-show marking, automatic Notion write, email, SMS, waiver execution or downstream public statistics are included.
- No historical attendance is inferred from Strava, RSVPs, photos or waivers.
- No automatic cross-source duplicate merge is included. A later RSVP from an already checked-in walk-in requires organizer review and correction, not assumed identity.

## Verification inventory

| Claim or control | Verification |
|---|---|
| Actual check-in is separate from RSVP | Unit counts, database read-before-write, browser counters |
| Organizer-only data | Anonymous, worker, unconfirmed and non-admin API tests; anonymous real route and signed-out page |
| Durable mutation and retry | Isolated PostgreSQL migration/RPC tests, duplicate key and payload conflict, browser identical-request retry |
| Corrections remain traceable | Database prior-state audit and browser reason flow |
| Two-organizer conflict | Revision mismatch database test and browser conflict response |
| Walk-in duplicate safety | Normalized same-name database rejection; browser add/search/filter |
| Close/reopen | Database locked-write rejection, reason rules and browser reviewed closure/reopening |
| Honest failures | Browser uncertain save, conflict and unavailable read states |
| Event boundaries | Future/cancelled database rejection and changed-snapshot fence; browser read-only state |
| Readable mobile workflow | 375px browser viewport and desktop/mobile visual inspection |

The test database is isolated PGlite, not production Supabase. Browser actions use synthetic runner fixtures against the actual organizer component. The fixture is local-only and not imported by production routes or builds. The authenticated production route and real Supabase policies still require staging verification.

The existing full attendance suite plus the new organizer tests totals 28 passing tests. Five organizer browser scenarios pass, in addition to the six public attendance scenarios. The production build, typecheck, new-module lint and authored-copy check also pass locally. Whole-repository lint is not claimed clean.

## Staging activation checklist

1. Confirm approval to use a staging project and synthetic accounts. Do not use production member data for the first pass.
2. Apply the attendance-foundation migration, the organizer-check-in migration and `20260922080000_checkin_privilege_hardening.sql`. Confirm grants, row-level security and security-definer ownership in real Supabase. The follow-up hardening explicitly removes inherited service-role table-write grants.
3. Sign in with two approved organizer test sessions. Verify denied access for anonymous, non-admin, unconfirmed and expired sessions.
4. Seed dated synthetic RSVPs for a completed staging run. Confirm no check-ins exist before explicit writes.
5. Exercise two simultaneous edits at the same revision, request retries, duplicate-name walk-ins, corrections, close and reopen.
6. Verify no confirmation, owner notification, Notion or SMS job is created by an attendance write.
7. Test phone reception loss before and after a committed write. Reconcile through the same request ID or a fresh read.
8. Confirm current run details, a waiver-review process, allowed organizers and audit retention with the operator before release.
9. Conduct one supervised attendance reconciliation against a real headcount before using the ledger for growth or retention reporting.

## Rollback

The subsequent [Staging Verification Report](./staging-verification-report.md) records a passing integrated local rehearsal, a default-privilege compatibility fix and the unresolved hosted-environment access gate. Hosted staging has not been signed off.

Disable or revert the new organizer route and API together if necessary. Preserve the private tables and audit records; do not drop them or rewrite previously recorded attendance as part of a code rollback. No production migration reversal is authorized here.

## Change log

- **Saved:** Organizer UI, private API, migration, isolated test fixtures and review documentation.
- **Tested locally:** Build, types, new-module lint, copy punctuation, data/permission tests and browser scenarios. Local testing is not production validation.
- **Queued:** Review through the existing PR and approved staging exercise.
- **Not performed:** Live deployment, real migration, member check-in, backfill, outbound communications or provider activation.
