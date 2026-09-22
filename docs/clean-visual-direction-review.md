# GRYT Clean Visual Direction

The subsequent organizer attendance pass adds a private check-in desk while preserving this public-site direction. See [Organizer Attendance Review](./organizer-attendance-review.md) for the new tools and current validation scope.

## Direction and provenance

Applied on the existing attendance review branch at the user's request. The visual reference is the user-supplied `IMG_7509.jpeg`, SHA-256 `a332550949c84e6c1a2ebde04672091cd6a6481451d4e7c82b4a704dc1fa4ac6`. The busier `IMG_7527.jpeg` direction is not used.

The reference is inspiration, not a new logo master or a rasterized webpage. The implementation retains the repository's existing crest asset unchanged, existing Oswald/Inter loading and current web blue `#89CFF0`. No colors sampled from the JPEG are presented as approved brand tokens.

## Applied

- Blue-and-black print texture in the hero and closing invitation, replacing the decorative diagonal bars.
- Live outlined display text and a solid final line. Existing A/B headline and subcopy variants, assignment logic and tracking are retained.
- Crest-led hero composition without the previous offset photo box. Existing real crew photography remains elsewhere on the page.
- Restrained secondary panels, solid-blue controls, quieter wordmarks and removal of decorative mission underlines within the homepage.
- Flat, readable RSVP surface, visible keyboard focus, reduced-motion support and high-contrast-mode fallback for outlined text.
- Matching dark surface and touch-target treatment on the calendar.

The page has not been converted into a screenshot. Run details, links, forms, validation and confirmation messages remain real HTML and existing React components. The uploaded JPEG is not downloaded by visitors, and this change adds no runtime packages.

## Deliberately preserved

RSVP persistence, provider jobs, event dates, waiver terms, auth boundaries, existing A/B assignment and analytics stay unchanged. This is not a copy experiment result or evidence that one variant performs better. Layout changes define a new review period; do not mix pre-redesign and post-redesign conversion results without annotation.

The two existing headline variants are preserved rather than forcing the reference's slogan on both. Variant B carries “Do hard things together”; variant A retains the existing parent-focused headline. No claim is made that the existing displayed community counts were reverified by this visual task.

The subsequent combined improvement pass merged and tested newer weather, route and club-stat work from `main`. See `docs/combined-improvement-review.md` for the latest integration safeguards and remaining activation gates.

## QA inventory

| Claim | Check |
|---|---|
| Both headline variants stay live and readable | Browser checks for A and B at 375, 390 and 1440px |
| No mobile overflow | Compare viewport and document width at each size |
| Attendance remains the primary action | Next-run details and sticky mobile action visible; keyboard hero CTA reaches RSVP |
| Styling does not break form states | Existing missing-input, failed-save, retry-key and synthetic confirmation tests |
| Calendar remains usable | Month navigation, download link and 375px fit |
| Accessible styling | Keyboard focus, reduced-motion treatment, forced-colors text fallback; visual desktop/mobile review |
| Existing app still builds | Typecheck and credential-free production build |

The attachment is a screenshot review, not a live form. Production credentials remain disconnected during local QA. Full deployed-platform assets, provider behavior and the combined current-main build remain staging checks, not claims made by this styling pass.

## Status

Saved to the existing review branch for the same review PR. Production publication, database migrations, provider sends and merging remain outside this approval.

Typecheck, the credential-free production build and all four local Playwright tests passed after the styling update. Browser checks cover both headline variants at 375, 390 and 1440px, along with the existing RSVP and calendar regressions. `git diff --check` is clean. The earlier repository-wide lint backlog is not represented as resolved.
