# This Saturday: Back-To-School 5K instead of the usual GRYT run

Tomorrow (Sat, Aug 29) there is no 7 AM Montour/Peters run. The club is running the Back-To-School 5K + Wellness Social for Pittsburgh Public Schools. Regular Saturday runs resume Sep 5 at 7 AM, same trailhead.

## What changes

1. **Skip Aug 29 in the schedule engine**
   - Add a skipped-dates list to the shared run schedule so Aug 29, 2026 is never returned as "the next run."
   - Everything already reading that library updates automatically: homepage countdown and RSVP block, the .ics download, the register page, the RSVP API, and the assistant/MCP schedule tool.
   - Numbering stays as anchored: the next GRYT run is **Run #18 · Sat, Sep 5 · 7:00 AM** at 212 Valley Brook Road, McMurray.

2. **Add a 5K event callout on the homepage**
   Placed directly above the Saturday run block, in the site's black/baby-blue/bone palette:
   - Eyebrow: THIS SATURDAY · NO 7 AM CLUB RUN
   - Headline: BACK TO SCHOOL 5K + WELLNESS SOCIAL
   - Aug 29 · 9:00 AM · Obama Academy of International Studies, 515 N Highland Ave, Pittsburgh, PA 15206
   - "Join Team GRYT when you register — fastest club takes the trophy."
   - Primary button: Register (https://runsignup.com/Race/PA/Pittsburgh/BackToSchool5KandWellnessSocial), plus "Use code GRYT for 15% off."
   - Closing line: "Regular GRYT runs pick back up Sat, Sep 5 · 7 AM · usual spot."
   - The uploaded flyer runs alongside the copy as the card image (desktop: side-by-side; mobile: image above copy).

3. **Auto-expire the callout**
   The block renders only through Aug 29; after that the homepage returns to the normal Saturday layout with no manual edit.

## Technical notes

- `src/lib/run-schedule.ts`: add `SKIPPED_RUN_DATES = ["2026-08-29"]`; `nextSaturday()` advances past any skipped Saturday. Run numbering continues from the existing anchor (Run #18 = Sep 5, 2026), so no renumbering.
- `src/routes/index.tsx`: new `FiveKNotice` component rendered above the Saturday/RSVP section, gated on current date <= Aug 29, 2026.
- Flyer registered via a Lovable asset pointer (`src/assets/*.asset.json`) and imported — no binary added to the repo.
- No backend, payment, or schema changes.
