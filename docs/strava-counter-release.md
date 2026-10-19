# Verified Strava counters: release gate

## Scope and environments

- Repository: `nickmerich/gryt-saturday-crew`.
- Candidate branch: `fix/verified-strava-counters`; base `c0bd121e61f81f637046e8f2fb137548b826d968`.
- Production domain: `https://grytrunclub.com`.
- Public HTML inspected before this change identified commit `6955ce016df9a2b980ba26708569d42fabed3970`. GitHub main and production were therefore not assumed identical.
- Lovable project: `ed7792b3-40ce-4ca7-a61e-885f853ac00b`.
- Repository-configured production backend: `jmphsnrrxvgscstrbxvx.supabase.co`; not visible in the connected Supabase account. Confirm Lovable Cloud ownership and deployed configuration before writes.
- Known separate staging project: `ccyejgyootpqnhfblffi`; currently reported inactive. No restore, migration, or paid operation was performed.
- Local QA: ignored `.env.local` points to `local-qa-disabled.invalid`. No production credential is needed for unit, migration, or mocked UI tests.

## Behavior

All three membership counters use the same query and component. Only a successful response for club 1708552 with a valid integer `member_count` becomes verified data; zero is valid, missing is not zero.

The server persists the count and timestamp, caching for 15 minutes. An open page requests refresh every 15 minutes and on focus when stale. This is request-driven refresh, not a scheduled background job or a real-time webhook.

On an upstream error, a last verified count is explicitly marked stale for at most 24 hours. Older or absent data displays an unavailable state, never the hardcoded 104 or fabricated sample 82.

Copied mileage and leaderboard snapshots are removed from the stats section. Official Strava widgets remain. Owned attendance metrics, RSVP, waiver, payment, and member-notification handlers remain separate and unchanged.

## Secure connection

Apply `20261019060000_verified_strava_connection.sql` to isolated staging first. The new table and refresh-lease function deny anonymous/authenticated access and are service-role-only.

Use the existing host's secure configuration for `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`. Never paste secret values into chat.

The owner signs into `/admin/strava/connect` using an already allowlisted admin account, then authorizes Strava with `read` scope. The server validates actor-bound, expiring OAuth state, verifies club access/count, encrypts tokens with an AES-GCM key derived from the server-only application secret, and persists the connection before reporting success.

Tokens never return to the browser. Refresh-token rotation is persisted before using a newly issued access token; a database lease prevents concurrent workers from rotating the same token.

The old `STRAVA_CLUB_REFRESH_TOKEN` environment setting is not imported automatically. Reauthorize once using the new flow after migration. Rotating `STRAVA_CLIENT_SECRET` also requires reconnecting because existing ciphertext cannot be decrypted with a different key.

## QA inventory

- All three counters agree on a synthetic verified response and a subsequent changed count.
- No connection: no numeric sample appears.
- Stale last-good count is labeled and retains the original verification time.
- Expired last-good count is hidden.
- Missing/invalid count, wrong club, revoked token, timeout, and save failure fail closed.
- OAuth state rejects wrong admin, expiry, and tampering.
- Anonymous admin requests are denied without data access.
- Database privileges deny both public roles; lease excludes another worker and recovers after expiry.
- Desktop and 375px mobile: inspect hero, stats, founder counters, empty state, and admin sign-in; no extra overflow or unreadable status text.
- Existing RSVP/waiver paths remain present; do not submit test records to production.
- No tokens in public responses, browser assets, screenshots, or logs.

## Remaining release gates

1. Review candidate diff and current-base CI.
2. Establish an active, isolated staging backend and confirm its server credentials.
3. Apply migration to staging, authorize a Strava account, and verify actual upstream results, persisted rotation, and all three rendered counts.
4. Obtain approval for production migration/merge/publish, with a database backup and previous deployment identified.
5. Confirm the live deployed commit and all three counts after publication.

Rollback: restore the previous application deployment if necessary; the new table is additive and can remain inaccessible to public clients. Do not drop it or destroy tokens as part of a routine code rollback. Recheck the rollback commit immediately before release, since main may advance.

## Local verification, October 19

- `tsc --noEmit`: passed.
- Focused ESLint on changed integration files: passed.
- `bun test tests`: 95 passed, 0 failed, including 25 new Strava/security tests.
- Production build under Node 22: passed; existing large-chunk warnings remain.
- PGlite 0.5.10 migration test: passed replay, anonymous/authenticated denial, service-role access, lease exclusion/expiry, and valid zero counts.
- Playwright: all three counters changed together for synthetic 105 then 106, all marked last-verified on a stale response, and all hid a value older than 24 hours.
- Playwright: 1440px desktop and 375px mobile had no horizontal overflow; admin sign-in rendered; anonymous GET/POST returned 403; RSVP and waiver entry points remained.
- Isolated review server blocks write methods, production backend access, analytics and payments. Existing public images are proxied read-only; Strava embeds can be unavailable without login.
- Existing app/third-party warnings encountered: calendar-link hydration differences, `allowTransparency`, and Strava iframe script errors. A Vite dependency re-optimization temporarily caused duplicate React during QA; a clean reload after optimization resolved it. These are not claimed as fixed by this patch.
- The repository's existing npm frozen install and Bun frozen lockfile paths failed before edits. Local dependencies were installed with `bun install --no-save`, without changing dependency manifests or lockfiles; the new focused CI workflow uses that same explicit path.

This does not establish a live Strava OAuth connection, real token rotation in hosted storage, a hosted staging pass, or production deployment. Those require the gates above.
