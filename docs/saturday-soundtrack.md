# Saturday Soundtrack

One optional song per Saturday RSVP. Organizers turn the week's songs into a
playlist and attach it to the public run report.

## What changed
- RSVP form: optional "Saturday Soundtrack" field, plus a "Put my first name next to it" opt-in that only appears once a song is typed.
- `/api/public/rsvp`: accepts `song` and `songCredit`. Song is cleaned and capped at 120 characters. Credit is never stored without a song. RSVPs without a song write exactly the same row as before.
- Pre-migration safety: if the song columns don't exist yet, the RSVP is saved without the song and the owner email still shows it, flagged "not saved to the database yet".
- Owner RSVP email: shows the song and the credit choice.
- `/admin/checkin`: new Saturday Soundtrack panel (same admin gate) listing this week's songs with opt-in first names and a Copy list button. Separate endpoint `/api/admin/soundtrack`, so it can never break check-in.
- Run reports: optional `soundtrack` in `src/content/run-reports.ts` renders the song list and a Spotify player that only loads after a tap.
- Privacy policy: new line describing the optional song and credit.
- Analytics: `rsvp_submit_success` gains `song_shared` (true/false only, never the song). New `soundtrack_player_load` and `soundtrack_open_spotify` events.

## Migration (not applied)
`drizzle/migrations/0014_rsvp_song.sql` is additive: `song text`, `song_credit boolean default false`, and a length check. Apply it through Lovable's database tools for the existing Lovable Cloud database only after this PR is approved. Code can ship before or after it.

## Weekly use
1. After RSVPs close, open `/admin/checkin`, scroll to Saturday Soundtrack, Copy list.
2. Build the playlist in Spotify ("GRYT Run #N").
3. Add `soundtrack: { playlist, songs }` to that run's entry in `src/content/run-reports.ts`. Use `from` only for names shown in the admin list.

## Verification
- `bun test tests/soundtrack.test.ts tests/rsvp-song-fallback.test.ts`: 14 pass (includes the pre-migration fallback).
- `tsc --noEmit` clean. `vite build` succeeds.
- Local visual check of the RSVP form (390px and 1280px) and a sample run report with the player, sample data removed before commit.
- Not verified: hosted staging, the real migration, live email rendering.
