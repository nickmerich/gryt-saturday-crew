# Where things stand, and what I propose next

## Summary of the notes so far

Across your recent notes there are three separate documents: a fix plan, a deployment blocker review, and a staged prompt pack (A through K). They agree on the order of work:

1. Trust first — no paid run entry, correct site addresses, working buttons. **Done in preview, not published.**
2. Read-only inventory (Prompt A). **Done.** All ten suspected issues were confirmed still present.
3. Reliable run dates and times (Prompt B). **Not started — this is the next piece.**
4. Everything after that (sign-up reliability, homepage, weather, route, reminders, check-in, merch, Strava, launch checks) waits on decisions only you can make.

Nothing has been published. Nothing has been charged, emailed, or backfilled.

## The one thing blocking everything downstream

The run time is currently guessed, not calculated. The schedule file says outright that 7:00 AM Eastern is "best-effort" 11:00 UTC. That is correct in summer and one hour wrong all winter. The homepage's search-engine event listing builds its end time by find-and-replacing the text "T11:00", so the moment the offset is wrong, the listing silently breaks too.

Verified in the code today:
- `src/lib/run-schedule.ts` line 81 hardcodes 11:00 UTC.
- `src/routes/index.tsx` line 178 patches the end time by string replacement of "T11:00".
- The downloadable calendar file already does this correctly with a proper timezone block, so the two paths disagree with each other.

## What I propose to build (Prompt B only)

One trustworthy definition of "the next run," used by every part of the site.

Each run occurrence carries: a stable ID, run number, the local date, 7:00 AM start and 8:00 AM end in Eastern time, the correct universal instants for those, its status (scheduled, changed, cancelled, happening now, finished), the meeting location, and a version number.

Behaviour rules:
- Today's run stays visible on Saturday morning right through the run, so nobody driving there at 6:55 finds the page has already jumped to next week.
- A cancelled Saturday still has a page with a visible cancellation notice rather than vanishing.
- Run numbering stays exactly as it is today (Run #18 = Sep 5, 2026, weekly).
- The sign-up form sends the run ID and version; the server checks them instead of trusting a text label.
- Old sign-up submissions that don't carry a run ID still work, via a compatibility path.

## Tests I will write and run

- A July run and a December run produce different universal times, both 7:00 AM locally.
- Oct 31 and Nov 7, 2026 (either side of the clock change) both read 7 AM.
- Friday, Saturday 6:59, 7:00, mid-run and post-run each show the right run.
- A cancelled or skipped Saturday, and the December-to-January rollover.
- A visitor in another timezone sees the same run as the server.
- A stale browser tab submitting a cancelled or changed run is rejected cleanly.
- The run ID and date match across homepage, calendar, sign-up and email samples.

## Scope limits

Preview only. No publishing, no database migration, no emails, no payment changes, no Prompt C or later work. Run numbering and the free Saturday sign-up journey are untouched.

## Still waiting on you

- Authoritative logistics wording (Saturday 7 AM, meeting point, whether the waiver is required to attend, Tuesday stays retired).
- Whether the first-person Q&A and attendance anecdotes are real, should be replaced, or removed.
- Who controls publishing to grytrunclub.com, and your go-ahead for the trust-first fixes already sitting in preview.

## Technical detail

- Add `getOccurrence(from)` / `occurrenceFor(date)` in `src/lib/run-schedule.ts` returning a typed `RunOccurrence`, built on an Eastern-time offset resolved with `Intl.DateTimeFormat` rather than a fixed number.
- Rewrite `nextSaturdayISOs` to emit correct instants per date; remove the `"T11:00"` string replacement at `src/routes/index.tsx:178` in favour of the occurrence's end instant.
- Keep `nextSaturdayLabel`, `nextRunNumber`, `nextSaturdayIcsDataUrl` as thin wrappers over the new occurrence so existing callers keep working.
- Server-side validation of `eventId` + `version` in `src/routes/api/public/rsvp.ts`, with the existing `eventLabel` accepted as legacy input and recorded, not trusted.
- New `tests/run-occurrence.test.ts` covering the cases above; `bun test` plus `bunx tsgo --noEmit` run before handing back.
