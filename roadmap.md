# Roadmap

## Live separate payments
- [ ] Enable environment-scoped checkout, webhook receipts and admin views; retain inactive test event and expired test package.
- [ ] Configure live tax head office, managed catalog and webhook events; verify descriptor and receipts or report owner actions.
- [ ] Run payment/Shopify/browser tests and current preview/security checks, publish, then verify public live checkout without paying.

## Separate test-only payments
- [x] Save supplied registered business address to sandbox tax settings; hat payment paid, shipping $0, automatic_tax complete with $0 calculated tax. Sandbox has no tax registrations; none invented or added.
- [x] Grant confirmed merichnick@gmail.com organizer access via existing server allowlist; create and pay $15 test-event (capacity 10) and $250 TEST Partner package, then deactivate event and expire private link. UI and database cleanup verified.
- [x] Unblock hat test checkout and complete purchase after saving registered sandbox head office; all four payment types reached Thank You and paid rows read back in the private payment desk and database. No live account changes or publishing.
- [x] Protect the shared form from pre-hydration GET submission, verify support/hat loading, visible failures and retries, and inactive-event/private-link gates. Signed-in $10 support card payment reached /thank-you and payments status paid in sandbox. Three browser tests, seven payment-rule tests, thirteen Shopify tests and lint passed; preview build OK. Event/partner checkout creation remains unverified without an active event or private link.
- [x] Add isolated support, hat checkout, inactive ticket event and private partner payment links using the existing managed Stripe sandbox.
- [x] Add private payment management, signed webhook records and atomic ticket/package reservations without touching Saturday RSVP, waiver or Shopify. Test webhook subscriptions updated only.
- [x] Verify 375/390/1440px pages without overflow or runtime errors, support/monthly Stripe mounting and cancellation, inactive-event/private-link protection, 7 payment tests and 13 Shopify tests. New-file lint and preview build passed.
- [x] Complete hat/ticket/partner/support card test purchases and admin create/cleanup verification. Eleven payment/access tests, thirteen Shopify tests, three checkout browser tests and changed-file lint passed; preview build OK. Monthly support and ACH not retested in this verification.
- [ ] Confirm Stripe receipt-email settings and set account statement descriptor to GRYT RUN CLUB. Blocked: Stripe rejects account settings updates through the available connection; owner must configure these in Stripe test settings. No live changes or publishing.

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
