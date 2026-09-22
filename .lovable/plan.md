# Connect your Strava account so the club numbers go live

The homepage code is already wired for real Strava data — it falls back to the sample set only because one credential is missing. Your Strava app ID and secret are already saved. The one thing left is a permission grant from a Strava account that belongs to the GRYT club.

## Why you have to click something

Strava will not hand out club numbers to an anonymous request. It only answers for a signed-in member of the club. So you approve GRYT once on a Strava screen, Strava hands back a long-lived key, and the site uses that key from then on. You do this once, not every week.

## What I'll build for you

A private page at **/admin/strava/connect**, behind your existing admin sign-in and hidden from search.

1. You open it and press **Authorize with Strava**.
2. Strava shows you its normal approval screen, asking to share club and activity data with GRYT.
3. You press Authorize. Strava sends you back to the page.
4. The page shows you one long key and a **Save this key** button that opens the secure secret form.
5. You paste it in, save, and the page confirms the homepage is now reading live.

After that I delete nothing — the page stays available in case the key ever needs redoing, but it is admin-only and does nothing until you press the button.

## What actually changes on the homepage

Once the key is saved, these stop being sample numbers:

- **Members** — the real club member count from Strava.
- **Miles and runs logged** — totalled from the club's activity feed.
- The "Sample data · not live yet" badge disappears and is replaced by the time of the last read.

## What I cannot make real, and will say so plainly

- **Attendance streak.** Strava has no attendance concept and no streak field. It comes from your Saturday sign-ups and check-ins instead. Until that's built, I'll remove the streak tile rather than leave an invented number on a page that otherwise shows real data.
- **Weekly miles.** Strava's club feed gives no dates at all, so "this week" cannot be calculated honestly from it. I'll relabel that tile as recent club miles, or drop it — your call once you see it.
- **Run dates.** Same reason. The recent-runs list will show distances without dates.

I'd rather show four true numbers than six with two guesses in them.

## Technical notes

- New route `src/routes/admin.strava.connect.tsx`, gated by the existing admin allowlist and session check, `noindex`, not in the sitemap, not linked publicly.
- Authorize link: `https://www.strava.com/oauth/authorize` with the saved `STRAVA_CLIENT_ID`, `response_type=code`, `approval_prompt=auto`, `scope=read,activity:read`, and `redirect_uri` set to this same route on the current origin. That callback URL must also be listed as the Authorization Callback Domain in your Strava API application settings — I'll show the exact value on the page.
- Callback handling in a server function: exchange `code` for tokens against `https://www.strava.com/api/v3/oauth/token` using `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET`, verify the returned athlete is a member of club 1708552 before showing anything, then render the `refresh_token` once. The token is never logged, never stored in the database, and never sent to analytics.
- Saving it as `STRAVA_CLUB_REFRESH_TOKEN` goes through the secure secret form — app code cannot write secrets, which is why it's a copy-paste step rather than automatic.
- `getClubStats` in `src/lib/strava-club.functions.ts` already reads that variable and switches to live automatically; add a short server-side cache (15 minutes) so the homepage doesn't hit Strava's rate limit on every view.
- Remove `longestStreakWeeks` from the live path and from `ClubStats`, and relabel `weeklyMiles`; update `ClubStats.tsx` accordingly.
- Preview only. Nothing published, and the existing Strava club embed stays as it is.
