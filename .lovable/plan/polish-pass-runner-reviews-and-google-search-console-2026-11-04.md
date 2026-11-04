# Polish pass, runner reviews, and Google Search Console

## 1. Runner reviews (private until approved)
- New public page `/review` plus a short "Leave a review" link on the homepage and in the footer.
- Form: first name, optional email (never shown), rating 1-5, short review (max 600 chars), and a consent checkbox "OK to show my first name and review on the site."
- After submitting, the runner sees a thank-you message. Nothing appears publicly yet.
- Private `/admin/reviews` (existing organizer access): list, approve, hide, delete.
- Approved reviews show as a small "What runners say" block above the Trusted by bar. It shows first name only and stays hidden when no reviews are approved.
- Spam guard: a daily per-email limit plus a hidden honeypot field. No emails are sent.

## 2. Homepage cleanup and mobile fixes
- Audit the homepage at 320, 375, 390, 768 and 1440. Remove repeated CTAs and extra clutter, and tighten spacing between sections. Keep "RSVP Saturday" as the main action.
- Fix any text that overflows, gets clipped, or wraps unevenly, plus tap targets under 44px, the poster and partner bar scaling, and the gaps around the highlights.
- No content, prices, stats or photos get changed or invented. The crest and real photos stay as they are.

## 3. Google Search Console
- Connect a Search Console account and request a verification tag for https://grytrunclub.com/.
- Add the tag to the site head, check the sitemap includes the public pages (the new `/review` page goes in, admin pages stay out), then publish (you approve that publish).
- Verify the site, add it as a property, and submit the sitemap.

## Guardrails
- Saturday RSVP, waiver, payments, Shopify and check-in stay unchanged.
- No emoji, no em dashes, and the gryt black/baby-blue system stays.

## Technical details
- Additive table `runner_reviews` (service-only, RLS on, grants for service_role), with a status of pending/approved/hidden, a consent timestamp, and an email-hash daily limit.
- Server functions for submitting, organizer moderation, and a public read that only returns approved reviews (first name, rating, text, date).
- Tests cover the length/rating limits, that only approved reviews are public, and that only first names are shown.
- Playwright screenshots of mobile and desktop, before and after.
