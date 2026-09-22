# GRYT Attendance Staging Verification

Historical preflight and local-rehearsal record. The user subsequently reauthorized Supabase and approved a new isolated project. See [Hosted Staging Verification](./hosted-staging-verification.md) for current results: hosted database checks pass, while real sign-in and app wiring remain pending.

## Outcome

**Hosted staging is blocked, not passed. The expanded local rehearsal passed.**

The approved working scope remains the review branch in [PR 15](https://github.com/nickmerich/gryt-saturday-crew/pull/15). The user asked to proceed with reasonable defaults after skipping environment selection. The safe default was no new paid resources, no production access, no copied member data and no restored unrelated project.

## Environment preflight

| Check | Observed result | Consequence |
|---|---|---|
| Repository-configured Supabase project | `jmphsnrrxvgscstrbxvx` | Not assumed to be staging |
| Connected Supabase project discovery | Only inactive `supabase-teal-kite`, ref `ihlztkwjroepucnnuxty` | Unrelated project was not restored or repurposed |
| Read of GRYT project metadata | Permission denied | No schema, data or authentication test against that project |
| GitHub environments for this repository | No configured environments returned | No approved hosted staging target identified |
| Local runtime | Supabase CLI present; Docker/Podman and Docker socket unavailable | Full local Supabase Auth/PostgREST stack could not run |
| Costs and account changes | None authorized or incurred by this work | No project creation, branch purchase or permission change |

The connected-project results are limited to the current connection. They do not prove that the user has no GRYT staging environment elsewhere.

## Local rehearsal performed

Run `npm run test:staging-rehearsal` from the repository.

This command uses an isolated PGlite PostgreSQL engine and the actual RSVP and organizer HTTP handler functions. The adapter executes the real SQL RPCs under `service_role`; it does not substitute successful mutation responses. It applies the relevant historical RSVP migrations, the attendance-foundation migration, the organizer-ledger migration and the privilege-hardening migration.

Auth identity results are injected fixtures. This does **not** test Supabase Auth, JWT verification, session refresh, magic-link delivery, PostgREST, real database connection concurrency, hosting secrets or production RLS. The optional signup-cookie path is not exercised in this rehearsal. The two-revision attempt verifies conflict behavior, not hosted multi-connection lock timing.

Network access is explicitly rejected during the test. The final outbound-request count is zero. RSVP capture creates three pending jobs in the disposable database, but no worker runs and check-in operations create no additional jobs.

### Passing scenarios

| Scenario | Result |
|---|---|
| Inherited/default grants | Reproduced a service-role direct-write exposure, applied explicit revocation, then passed 26 read-only catalog gates |
| RSVP to organizer board | Real capture handler persists one idempotent RSVP; organizer board shows masked contact and no inferred attendance |
| Access decisions | Injected expired, non-admin and unconfirmed identities are denied without writes |
| Response lost after commit | First request returns an uncertain failure; identical retry produces no second check-in or audit row |
| Actor and revision conflicts | A different actor cannot reuse the request; two requests using the same revision produce one success and one conflict |
| Atomic rollback | Deliberate audit-write failure rolls back presence, revision and request receipt; retry succeeds after the injected fault is removed |
| Run-day operations | Same-name walk-in review, correction, close and reopen retain the audit and do not trigger new jobs |

The test runner reports seven passing tests: one parent rehearsal and six scenario subtests. These are additional to the existing 28 attendance tests, not seven hosted-staging checks.

All 28 existing attendance tests were rerun and passed after the privilege migration was added. Typecheck and the authored-copy punctuation check also passed. The website UI was not changed in this phase, so the earlier browser screenshots and eleven browser scenarios are prior-phase evidence, not new hosted-staging results.

## Defect found and fixed

The original ledger migration revoked table privileges from public and ordinary authenticated roles but only omitted service-role mutation grants. A database with inherited default grants can therefore still grant direct service-role `INSERT`, `UPDATE`, `DELETE` or `TRUNCATE` privileges.

The local rehearsal deliberately configured inherited grants and reproduced that exposure. New migration `20260922080000_checkin_privilege_hardening.sql` explicitly revokes service-role privileges on the four ledger tables, restores only the intended read permissions and removes direct audit-sequence access. The security-definer RPC remains the application write path.

This is a demonstrated compatibility risk under inherited grants, **not a claim that the inaccessible GRYT database currently has those grants**. Database owners remain privileged; the ledger is not cryptographically tamper-proof.

## Read-only hosted preflight prepared

`scripts/checkin-staging-preflight.sql` checks 26 catalog conditions without returning runner data, auth identities or secrets:

- Four ledger tables exist and have RLS enabled.
- Anonymous, authenticated and service roles cannot mutate the tables directly.
- Anonymous and authenticated roles cannot read the tables.
- Both RPCs are security-definer, use the expected search path, permit service-role execution and deny ordinary public execution.

Run this only after selecting the isolated staging project. Passing catalog checks is necessary but does not establish environment identity, safe function ownership, correct migration contents, absence of extra policies/grants, actual auth behavior or end-to-end deployment correctness.

## Remaining hosted release gates

1. Identify and authorize an isolated GRYT staging database and app deployment. Confirm they do not share production secrets or data.
2. Make that project accessible through the approved connection. Do not substitute production credentials.
3. Apply the foundation, organizer and privilege-hardening migrations to staging only, after confirming prerequisite schema and reviewing actual grants.
4. Run the catalog preflight and inspect function ownership, policy/grant drift, migrations and provider security advisories.
5. Use two approved organizer sessions plus non-admin, unconfirmed and expired sessions through real Supabase Auth.
6. Exercise the real browser/API/PostgREST/database path, including retry after a lost response, simultaneous writes from separate connections, closure, reopening and changed-event blocking.
7. Verify hosted cookies, environment isolation, no-store responses and absence of messaging or Notion effects.
8. Complete a supervised physical headcount reconciliation before using the ledger for retention or growth reporting.

## Release decision

**Do not merge or activate solely on this rehearsal.** Hosted staging verification remains blocked by environment identification and access. The review branch now has a reproducible integrated rehearsal, a demonstrated privilege fix and a read-only catalog preflight ready for the correct staging target.

No production migration, hosted deployment, real attendance write, real auth account creation, outbound communication, new project purchase or main-branch merge was performed.
