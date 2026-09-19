# GRYT inquiry queue: Lovable activation

## Included

- `/inquire?type=attendee`: event interest, not ticketing or RSVP.
- `/inquire?type=vendor`: vendor review, not booth approval.
- `/inquire?type=brand`: residency interest, with cash and in-kind separated.
- `/admin/inquiries`: existing admin accounts only; verified server-side on every read/write.
- Read-only original submission/consent, owner, status, next action/date, append-only notes/history, version conflicts and filtered-page JSON export.
- Server-only Supabase access. Anonymous and authenticated clients have no direct table access.
- UUID-based retry keys and atomic per-contact throttling (five new requests/hour).

This extends the existing Lovable app. It does not use the Computer sandbox database or import any fictional sample records. It leaves the existing Saturday RSVP, waiver, Notion member sync and email integrations unchanged.

## Required activation in Lovable Cloud

The connected external Supabase integration cannot access this project's database (`jmphsnrrxvgscstrbxvx`). The migration has NOT been applied by Computer.

1. Apply `supabase/migrations/20260919070000_gryt_inquiry_queue.sql` to the existing Lovable Cloud database using Lovable's database tools. Do not create a second Supabase project.
2. Confirm RLS is enabled and no anonymous/authenticated read or write grants or policies exist for `gryt_inquiries`. Only the service-role server routes may access it.
3. Confirm the existing server Supabase URL/service-role environment settings work.
4. Set server environment variable `GRYT_INQUIRIES_ENABLED=true` only after the migration succeeds. Default is disabled; do not make this a client-side flag.
5. Test on staging with synthetic example-domain contacts. Verify three form saves, reload persistence, admin read/write, anonymous/non-admin denial, duplicate retry and stale edit conflict. Delete synthetic records manually before launch if staging shares production storage, with explicit approval.
6. Review event copy and privacy handling. Publish only with Nick's approval.

The admin allowlist is reused unchanged. No account was added. If an operator lacks access, use the existing approved account or make a separately authorized access change.

## Operational boundaries

This version sends no emails, creates no tickets/waivers or attendance, approves no vendors, and signs no partnerships. No operator data is synchronized into Notion automatically. General marketing consent is separately recorded and never toggled by triage.

The queue loads 100 records per page. Search, filters, sorting, page metrics and exports apply to the current page and are labeled accordingly. Total inquiries counts all records. Server-side cross-page search and reporting are a follow-up enhancement.

Per-contact throttling and a honeypot reduce simple spam but do not replace WAF/IP limits or a bot challenge. Configure those before high-volume paid promotion. Retention/deletion policy and a consent withdrawal workflow need owner review before scaling intake.

Public copy preserves uncertainty: park/field permits, date, price, games, age eligibility, nonprofit recipient, shoe standards and the before-winter distribution deadline are not confirmed. Saturday weekly runs are always free. The $10,000 founding residency figure is a goal, not secured revenue.

## Disable / rollback

Set `GRYT_INQUIRIES_ENABLED=false` to stop new intake without deleting records or disabling operator review. Revert the feature commit if needed; retain the data table unless deletion is separately approved. Never rewrite published Git history because Lovable synchronizes it.

## Verification performed

- Production build and TypeScript checks passed locally.
- Eight schema tests passed, covering normalization, required fields, consent defaults, type-specific validation, unsafe URL rejection, protected-field stripping, dates and status semantics.
- The full repository test suite passed with Bun: 25 tests, zero failures. The existing suites require Bun rather than Node's test runner.
- The migration executed successfully in isolated PGlite/PostgreSQL. Retry identity, mismatched-key rejection, contact throttling, consent/audit capture, RLS, anonymous/authenticated denial, service-role access, stage/date constraints and optimistic updates passed.
- Browser tests verified all three inquiry review/edit/save flows with mocked endpoints, retained edits, default marketing opt-out, admin sign-in gate, queue filters, notes and triage updates. Mobile/desktop and light/dark layouts were inspected; no horizontal overflow or runtime errors were observed.
- Real local route checks returned HTTP 403 for anonymous queue access and HTTP 503 for disabled intake.
- No production inquiry was submitted. The actual Lovable Cloud migration and end-to-end production persistence remain unverified until activation.
