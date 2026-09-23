# Use the real Strava widgets in place of the sample numbers

## What changes
The "Crew in numbers" section currently shows made-up numbers (82 members, 214 miles, 4,860, 318 runs) and three made-up "Saturday Montour" runs. While Strava isn't connected, those get replaced with the two official Strava widgets you pasted, which show real club data.

- **Sample tiles and fake runs:** hidden while Strava is still disconnected. The "Sample data · not live yet" badge and the note at the bottom go too.
- **Week summary widget** (runs, distance, time, elevation): stays at the top, labelled "This week on Strava".
- **Latest activity widget** (the recent runs feed): added next to the summary on desktop and below it on phones, labelled "Latest runs on Strava".
- **Saturday attendance row:** stays as it is, and appears once there are check-ins.
- **If you connect Strava later:** the live number tiles come back automatically.

Nothing else on the page changes. You'll see it in the preview only; nothing gets published.

## Technical details
- `StravaClubEmbed.tsx` takes a `variant` prop: `summary` (show_rides=false, 160px tall) or `activity` (show_rides=true, 454px tall). Both are 300px wide, lazy-loaded and on a paper background.
- `ClubStats.tsx`: when `stats.isSample` is true, skip the Figure grid, the recent runs list, the badge and the footer note. Render both embeds in a `grid sm:grid-cols-2` instead. When stats are live, keep the current layout and show both embeds under it.
- Check: typecheck, plus a browser check at 390px and 1280px.
