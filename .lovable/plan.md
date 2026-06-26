## Problem

The `/waiver` form submission calls `signWaiver`, which inserts into `public.waiver_signatures` using the publishable (anon) key. The table has an RLS INSERT policy ("Anyone can submit a valid 2026 waiver" for anon/authenticated), **but no table-level GRANTs exist**. Supabase's Data API requires explicit GRANTs in addition to RLS — without them, every insert returns a permission error and the user sees "We couldn't save your signature."

Verified via `information_schema.role_table_grants` — zero grants on `public.waiver_signatures`.

## Fix

One migration that adds the missing grants (matching the existing policy surface):

```sql
GRANT INSERT ON public.waiver_signatures TO anon, authenticated;
GRANT ALL    ON public.waiver_signatures TO service_role;
```

No SELECT for anon/authenticated — reads are done through `supabaseAdmin` in `checkWaiverStatus`, so service_role coverage is enough.

## Verify

1. After the migration runs, invoke `signWaiver` end-to-end via Playwright against `/waiver` with a valid test payload and confirm:
   - Success view renders ("Waiver signed — you're covered through Dec 31, 2026.")
   - A row exists in `waiver_signatures` (confirm via `supabase--read_query`)
2. Invoke `checkWaiverStatus` for that email and confirm `signed: true`.
3. Re-test the homepage `RSVPWaiverBlock` to confirm the badge swap still works once a signature exists.

No application-code changes are required — the bug is purely a missing DB grant.
