# Roadmap

## Homepage simplification
- [x] Focus homepage on the run, RSVP, arrival steps, weather and approved trail map; link to secondary pages.
- [x] Check simplified homepage on phone and desktop: no horizontal overflow, RSVP anchor and mobile menu verified; build OK. No real sign-up submitted.

## Partners page
- [x] Add private partner approval, logo upload and inquiry inbox using existing admin access.
- [x] Add public partners page, conditional homepage strip, footer and sitemap links.
- [x] Verify public approval/privacy/form rules and phone/desktop layouts. Preview only.
- [ ] Verify admin editing, upload and status/CSV end-to-end: blocked by available test account lacking existing admin permission.
- [x] One-step SVG/PNG logo upload with preview; homepage tile shows the logo.

## Saturday Lives Online brief
- [ ] Waiting on owner: PR #52 not merged here (BringAFriend, library.ts missing) and gryt_inquiries table not in the database.

## Phase 1 — Saturday tools
- [x] Saturday weather widget (NWS forecast for 7:00 AM at the Valley Brook lot)
- [x] Rain/wind alert state on the weather widget
- [x] Montour Trail route map (Leaflet + OSM), parking pin, turnaround markers
- [x] Selectable 3 mi / 5 mi / 10K routes, each with its own elevation profile
- [x] Mobile-first layout for both, quick to read Saturday morning
- [x] Strava club stats component (miles, members, recent group runs)
- [ ] Live Strava club data — blocked: needs STRAVA_CLUB_REFRESH_TOKEN. Client ID/secret are saved; the token needs a one-time approval at /admin/strava/connect.
- [x] Saturday attendance streaks from confirmed check-ins (src/lib/streaks.ts, shown on /admin/checkin and the homepage once check-ins exist)
