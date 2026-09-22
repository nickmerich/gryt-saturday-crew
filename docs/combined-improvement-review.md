# GRYT Combined Improvement Review

## What changed in this pass

The review branch now includes upstream `main` through `3f8759e` using a normal merge commit. The cleaner visual direction and em-dash-free authored copy are preserved. No changes were merged into `main`, deployed live, applied to production databases or sent to real members.

### Arrival and RSVP

- The top navigation now leads to RSVP instead of sending visitors to Strava first.
- Keyboard users have a skip-to-RSVP link. The RSVP is now a native form, supports Enter, validates contact format before a request, and retains durable server-side validation.
- Hero statistics have been replaced with practical reassurance: free, all paces and first-timers welcome. Existing claims elsewhere in the site have not been comprehensively reverified.
- Run labels include the year. `completed` is now an explicit reviewed event status.
- Saved receipts restore only when event ID, version, time, route, location and status match. A changed invitation does not silently inherit an earlier RSVP.
- A lost queue claim cannot be reported as successfully checkpointed. The worker requires a returned row from the fenced update.

### Weather

The upstream adapter treated missing precipitation as zero and used dew point as a feels-like value. Those paths have been removed. The new pure adapter matches the forecast period covering the actual event instant, handles summer/winter offsets and changed start times, and preserves missing measurements as unknown.

Freshness is explicit. Missing, stale or implausibly future timestamps produce an unavailable state rather than current-looking weather. Requests have timeouts, a provider-domain check, redirect restrictions, bounded cache lifetimes and shared in-flight work.

Weather is not enabled until an organizer verifies a forecast point. Configure these server-only, non-secret values in an approved staging deployment:

- `GRYT_FORECAST_LAT`: verified latitude.
- `GRYT_FORECAST_LON`: verified longitude.
- `GRYT_FORECAST_LOCATION`: exact canonical event address associated with that point.

A changed meeting address invalidates that mapping. No coordinate was guessed or approved during this task. The preview deliberately shows the unconfigured state, not a fabricated forecast.

### Route and Strava integrity

The upstream map contains an approximate polyline and hand-entered elevation values without verified route evidence. The public component now uses an out-and-back distance planner and address-based directions instead. The planner labels its output as arithmetic, not a surveyed marker. The unverified map/profile helpers remain in source for review but are not imported by the public route component.

The upstream Strava adapter mixed undated activity sums and sample streaks into a live-looking statistics response. The public activity/statistics fetch has been disabled pending an approved integration design. No sample counts, invented streaks or athlete activity list are substituted. The club link remains useful, and Strava is not required to RSVP.

These changes intentionally reduce apparent feature completeness in favor of factual integrity. A verified GPX/route source, approved parking pin and compliant data-use/token lifecycle are separate activation gates.

## Verification

- Combined branch typecheck and credential-free production build pass.
- Attendance/API/isolated database/weather/integrity suite: 23 tests pass.
- Six browser scenarios pass. Coverage includes both hero variants at 375, 390 and 1440px; failed saves; retry keys; synthetic phone confirmation; calendar navigation; utility fallbacks; route-planner controls; keyboard submission and local validation.
- Desktop and mobile screens were visually inspected. Exploratory checks covered forecast retry, distance changes and return to the default, and navigation to RSVP below the fixed header. No horizontal overflow was found in the checked mobile homepage and calendar. Section-only gallery captures hide fixed navigation for legibility; the hero and calendar captures retain the real viewport.
- Copy check reports zero em dashes in authored strings and JSX. Comments, generated files, third-party content and historical emails are outside that check.
- No real database, email or Notion success is claimed by local tests. Actual provider delivery, staging policies, verified forecast-point behavior and a supervised attendance reconciliation still require separate testing and approval.

## Still open

- Organizer event-status editor. Status overrides remain source-controlled. The subsequent organizer attendance pass adds a private check-in ledger, documented in `organizer-attendance-review.md`, but does not change public event status.
- Verified route geometry, exact parking pin and elevation evidence.
- Forecast-point approval and provider-backed staging checks.
- Full reviewed Strava integration, if still desired. Do not infer weekly attendance from club activities.
- Staging migration and worker configuration, authorized test recipients and controlled recovery rehearsal.
- Existing whole-site lint backlog and unrelated older copy/claims are not certified clean.

## Release boundary

All work remains in the existing review PR. GitHub currently marks that PR open and ready for review, not draft; this pass does not alter that status or merge it. The attached preview is a screenshot review of the combined branch. It is not an active signup form or evidence that integrations are live.
