## Plan: End-to-end RLS test for recap uploads (user vs service_role)

Extend `e2e/recaps-bucket-rls.spec.ts` with two additional cases that go beyond the existing anon-denial checks:

### New test cases

1. **Authenticated (non-admin) user cannot upload to `recaps`**
   - Create a temporary auth user via `supabaseAdmin.auth.admin.createUser` (email-confirmed, random email/password).
   - Sign that user in with a fresh publishable-key client to obtain a session (acts as `authenticated` role).
   - Attempt `storage.from("recaps").upload(...)` — assert an error is returned (RLS blocks `authenticated`).
   - Also assert `list`, `download`, and `createSignedUrl` are blocked for the signed-in user.
   - Cleanup: `supabaseAdmin.auth.admin.deleteUser(userId)` in `test.afterAll`.

2. **`service_role` (admin) can upload, sign, and delete in `recaps`**
   - Build a `service_role` client from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (mirrors what `uploadRecap` does via `supabaseAdmin`).
   - Upload a 1x1 PNG to a unique path — assert no error.
   - `createSignedUrl` for that path — assert a URL is returned; `fetch` it and assert 200.
   - `remove([path])` — assert no error. Skip the whole admin block via `test.skip` if `SUPABASE_SERVICE_ROLE_KEY` isn't in the env (local runs may not have it).

### Technical details

- File: `e2e/recaps-bucket-rls.spec.ts` (extend, don't replace existing anon cases).
- Env vars used: `VITE_SUPABASE_URL`/`SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_PUBLISHABLE_KEY`, and (new) `SUPABASE_SERVICE_ROLE_KEY` — gate admin/user-creation blocks on its presence with `test.skip`.
- Use `test.describe.serial` for the admin block so upload → sign → delete run in order and clean up.
- Keep the pattern consistent with the existing file: `createClient` with `persistSession: false`, unique timestamped paths, minimal PNG buffer already defined.
- No app-code changes; this is test-only.

### Verification

Run `bunx playwright test e2e/recaps-bucket-rls.spec.ts` and confirm all cases (existing + new) pass, with the admin block skipped cleanly if the service role key isn't present.
