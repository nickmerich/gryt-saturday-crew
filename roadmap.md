# Roadmap

## Separate test-only payments
- [ ] Add isolated support, hat checkout, inactive ticket event and private partner payment links using the existing managed Stripe sandbox.
- [ ] Add private payment management, signed webhook records and capacity-safe reservations without touching Saturday RSVP, waiver or Shopify.
- [ ] Verify test-only enforcement and all four purchase flows; no publishing or live transactions.

## Executive producer story
- [x] Add approved origin story to About, text-only Music Nerd footer credit and factual llms line; verified 375/390/1440px without overflow or runtime errors, RSVP destination, waiver form and plain-text llms response. Build OK. Preview only; C.Y. quote excluded. No RSVP submitted or auth changes.

## Founding member hat
- [x] Verify Shopify price $30 and active status; update renamed product handle, current API and automatic inventory display out of 100.
- [ ] Set remaining inventory to 5 and make product available to website checkout. Blocked: Shopify shows 10 and returns no product to the website; available tools cannot change inventory or sales-channel publication. Owner must update these in Shopify.

## Recap graphic page
- [x] Tested touch editing at 320/360/375/390/414/430px; fixed 36px sharing/reset buttons to 48px, stacked mobile actions and enlarged consent checkbox. Photo adjustments, download and reset pass at all six widths without overflow or runtime errors. Build OK; external sharing untested. Preview only.
- [x] Enlarge editing controls to 48px, stack numeric fields on phones and label units/photo movement clearly; verified upload, zoom, reset, remove and no overflow at 375/390/1440px. Build OK; preview only.
- [x] Polish recap headings, contrast, fields, shared controls and compact preview; remove duplicate style selector and fix phone navigation overflow. Verified manual edit, PNG download and reset at 375/390/1440px; build OK. Saved data and graphic templates unchanged; external account import/share upload untested. Preview only.

## GRYT 100 runner highlights
- [x] Add accessible photo-load fallback, preserving photo dimensions and readable highlights at 375/1440px; all three full-story destinations verified. Preview only.
- [x] Add Meet all runners beneath highlights, descriptive photo text and inverse-color keyboard focus; verified all three destinations and focus at 375/1440px without overflow. Build OK; preview only.
- [x] Refine hierarchy with results beneath names, 16px body text, stronger contrast and 44px story links; verified 375/390/1440px without overflow, both story targets and minimum text contrast 12.25:1. Build OK; preview only.
- [x] Replace the homepage first-Saturday section with Laura and Nick's public runner stories, real photography, concise labels and supporting details.
- [x] Verify loaded photography, Laura's story link, removed old section and phone/desktop layout without overflow; build OK. Preview only, no publishing.

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

## Music Tectonics event page
- [x] /music-tectonics page, RSVP form, success state (announced to screen readers, focus moves to it), admin view + consent-only CSV
- [x] Verify success state, details, calendar download and badge reminder on phone and desktop
