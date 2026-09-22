# Free runs: first audit fix PR

## Scope and business rules

GRYT runs are free. Brand partnerships fund the business; merchandise can be
earned or purchased online. Neither merchandise nor donations is a prerequisite
to RSVP or attend.

This change:

- Replaces `/register` with a server-side 308 redirect to `/#join`, discarding
  stale event/payment query parameters.
- Refuses every payload sent to `createEventEntryCheckout` without constructing
  a Stripe client. This includes renamed IDs, sandbox requests and $0 checkout.
- Removes registration from the sitemap.
- Corrects canonical and Open Graph URLs on the three resource hubs.
- Repairs the audited RSVP links and adds isolated regression checks.

It does not implement a merchandise store, earned-merch rules, partner billing,
or a new donation policy. The donation handler, historical payment records,
payment webhooks and hosted Stripe sessions remain untouched. An unused legacy
event checkout component remains compatible with the refusal response, rather
than becoming a second payment implementation.

## Relationship to other work

Based on main `3f8759e1657c20b5e2ba41b2e12cc2b31a327aab`.
[PR #15](https://github.com/nickmerich/gryt-saturday-crew/pull/15) owns attendance,
schedule/DST handling and signup recovery. This PR deliberately leaves those
surfaces alone. Re-run both suites against the actual merge candidate.

The Conversations canonical correction overlaps the narrower
[PR #9](https://github.com/nickmerich/gryt-saturday-crew/pull/9). Review that overlap
before merging; this PR does not close or merge other branches.

## Automated checks

Use Node 22 and Bun 1.4.2, as pinned in the workflow. No production secrets are
required. Set the following before installation/build/server startup:

```sh
export VITE_SUPABASE_URL=http://127.0.0.1:9
export VITE_SUPABASE_PUBLISHABLE_KEY=isolated-public-test-key
export VITE_SUPABASE_ANON_KEY=isolated-public-test-key
export VITE_PAYMENTS_CLIENT_TOKEN=pk_test_isolated
bun install --frozen-lockfile --ignore-scripts
bun run test:free-runs
bun test tests/inquiry-schema.test.ts tests/resources-email-recipients.test.ts tests/mcp-public-allowlist.test.ts
bun run typecheck
bun run build
bunx playwright install chromium
bun run dev --host 127.0.0.1 --port 4173
```

In another terminal, with the app running:

```sh
EXPECTED_COMMIT="$(git rev-parse HEAD)" bun run check:free-runs:deployment
bun run test:free-runs:e2e
```

The build must be from a committed, clean checkout for the release identity
check to pass. Build writes an ignored `public/release.json` containing the
source SHA and dirty status, not credentials. Builders without `.git` must set
`GRYT_BUILD_COMMIT` to the actual full source SHA; do not invent a SHA to bypass
the check. Ensure the deployment provider runs the build script, not `vite build`
directly, and copies the generated marker with its static assets.

The 22 new tests include actual handler bodies behind a mocked TanStack transport
and Stripe provider, route redirect behavior, sitemap output, and source-level
metadata/link invariants. The 6 browser checks exercise desktop and mobile
redirects, rendered metadata and a guide-to-RSVP click path. Browser tests allow
only local GET/HEAD requests and abort writes and external requests. They do not
prove actual attendance persistence, payment-provider behavior or email delivery.

CI also compiles the production bundle, but serves a local Vite development
runtime for HTTP/browser checks. Provider preview and production runtime checks
below are separate gates, not implied by a green local suite.

## Pre-merge and deployment gates

- [ ] Review the diff and green `free-runs-regression` check on the final merge
  candidate. Confirm deployment provider, project, branch and source SHA.
- [ ] Confirm that branch pushes cannot automatically deploy to the live domain.
  Do not merge or manually publish without the owner's approval.
- [ ] Inventory existing open event-entry Checkout Sessions, Payment Links and
  externally shared purchase URLs in both Stripe environments. Include metadata
  `type=event_entry`, `eventId`, amount, status and expiry; do not expose customer
  information in public PR comments.
- [ ] Obtain approval for specific hosted-session expirations/Payment Link
  deactivations. This source change cannot invalidate already issued checkout
  URLs. Historical completed payments, refunds and customer communication need
  separate explicit decisions.
- [ ] Deploy an approved preview from the exact reviewed SHA using the provider's
  normal configuration. Never publish a dummy-credential build to production.
- [ ] Confirm the generated run-entry server function refuses a legacy request
  on the deployed runtime without returning a client secret or creating a Stripe
  session. Resolve the function through the deployed client manifest, not a
  guessed URL. Old hashed endpoints may instead be absent; confirm they cannot
  create sessions. Use sandbox only for any provider inspection.
- [ ] Run the GET-only smoke script against the preview, then the approved live
  deployment, supplying the deployed SHA (the merge SHA may differ from PR HEAD):

```sh
DEPLOYMENT_BASE_URL=https://grytrunclub.com \
EXPECTED_COMMIT=FULL_40_CHARACTER_DEPLOYED_SHA \
bun run check:free-runs:deployment
```

- [ ] Confirm the marker, both `/register` redirects, all three SSR canonical/
  OG tags, the sitemap, homepage targets and corrected CTAs pass.
- [ ] Manually check mobile and desktop on the deployed runtime, including
  direct `/register` entry and guide CTA navigation. Verify the free RSVP
  remains usable. Only submit a clearly designated test RSVP with approval
  because it can write attendance records or trigger email.
- [ ] Check logs for route/server errors and the provider inventory for new
  event-entry sessions after release. Donation/merch flows are separate and
  must not be disabled as collateral damage.
- [ ] Record deploy URL, exact SHA, smoke output, owner approval and unresolved
  gates in the PR or release record.

This PR does not authorize Search Console submissions, session expiration,
refunds, emails, merges or live deployment.

## Rollback

Prefer a forward fix. If metadata/CTA changes regress, revert those separately
while retaining the run-entry refusal and free RSVP redirect. A blanket rollback
would restore paid admission and contradict the approved business model.

If the RSVP destination becomes unavailable, keep paid checkout disabled and
serve a temporary free-run information/contact page until RSVP recovery is
complete. Do not re-enable payment to restore availability. Rebuild with the
rollback commit's own release marker and repeat the smoke checks.

## Remaining audit work

Homepage schedule/run-number consistency, signup recovery and attendance are
tracked separately. Image/performance work, earned-merch criteria and inventory,
partner conversion copy, broader legacy redirects and direct `/#first-time`
backward compatibility are not represented as fixed by this patch.
