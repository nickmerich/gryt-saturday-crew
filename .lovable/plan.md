# Newsletter bar: biweekly copy + cleaner sticky behavior

## What changes

Reword the email signup so it no longer promises a weekly Friday email, and tighten the bar so it reads clean and stays pinned under the nav.

### Copy

- Sub-label: `EMAIL DROPS EVERY FRIDAY` -> `BIWEEKLY · RUNS, EVENTS, MERCH, PARTNERS, RESOURCES`
- Consent line: `One email a week. No spam, no sharing. Unsubscribe any time.` -> `Biweekly. No spam, no sharing. Unsubscribe any time.`
- Success state: `We just sent a confirmation link — click it to lock in Friday drops.` -> `We just sent a confirmation link — click it to lock in the biweekly drop.`
- Screen-reader hint: replace "weekly Saturday brief" with "biweekly GRYT email".
- Form aria-label: "Subscribe to the GRYT Saturday brief" -> "Subscribe to the biweekly GRYT email".
- Headline stays `DO HARD THINGS TOGETHER`.

### Sticky + polish

The bar is already `sticky top-[68px]`, but the parent has no `relative`, so the diagonal stripe accents and the dismiss button are positioned against the page rather than the bar. Add `relative` to the bar wrapper so those absolute elements anchor correctly, and keep the sticky offset matched to the 68px nav height.

Layout cleanup so the longer sub-label doesn't crowd the form:
- Allow the sub-label to wrap/truncate gracefully on small screens (shorter mobile variant: `BIWEEKLY · RUNS, EVENTS, MERCH`, full string from `sm:` up).
- Keep the label block and form on one row from `sm:` up, stacked on mobile, with consistent vertical padding.

## Technical notes

All edits are in the `NewsletterBar` component in `src/routes/index.tsx` (around lines 3404-3643). No backend, Beehiiv, or subscribe-route changes — send cadence is managed in the newsletter tool, not the app.
