# Remove the redundant "Saturday is already planned" block, keep the details, extend its look

## What changes

1. **Delete the standalone details section** ("THE PLAN IS SIMPLE / Saturday is already planned." with the WHEN–AFTER table and the "I'm coming this Saturday" button). It repeats the RSVP block and the Saturday article.

2. **Nothing is lost.** The RSVP block's fact list grows from three rows (WHEN, WHERE, FIRST?) to the full set:
   - When · Saturday · 7:00 AM (next-Saturday date, as today)
   - Where · 212 Valley Brook Road, McMurray + Get directions
   - Route · Montour / Peters Trail · Peters Township & Upper St. Clair
   - Distance · About 4 miles · out and back
   - Pace · Walk, jog, run · all welcome
   - Cost · Free, always
   - After · Coffee, water, sometimes fruit in the lot
   - First? · Most people come alone. Show up 10 min early.

   Rows use the same hairline-rule treatment as the deleted block (uppercase label left, value right, thin divider between rows), tuned for the dark RSVP panel.

3. **Carry the bone/cream panel forward.** The `#f4f2ed` bone surface with hard corners, 2px ink top rule, and hairline dividers becomes a repeating homepage rhythm instead of a one-off:
   - Alternate homepage sections between ink-black and bone so the page reads as stacked panels rather than one long black scroll.
   - Any section that currently sits on plain black and lists facts or steps (the "first time" steps, the FAQ preview, the details inside the Saturday article) gets the bone panel + ink type + hairline-rule pattern.
   - Section eyebrows on bone use the muted steel-blue (`#3a7ca5`) already used in the deleted block; headlines stay condensed uppercase; baby blue stays the accent for links and the mission slash.
   - Photo grids, hero, marquee, and footer stay black — the contrast is what makes the bone panels land.

4. **Anchor safety.** The removed section owns `id="details"`, which the nav "The Run" link and other in-page links point to. That id moves onto the section that keeps the run facts so no link breaks.

## Technical notes

- `QuickDetails()` in `src/routes/index.tsx` is deleted along with its render call; its `id="details"` moves to the RSVP section (currently `id="join"`, which keeps an anchor alias).
- The row list inside the RSVP block is extended and restyled to the label/value/hairline pattern; no data fetching or server code changes.
- Bone panel styling is applied via existing Tailwind classes and, where it repeats more than twice, a small `@utility bone-panel` in `src/styles.css` so the treatment stays consistent.
- Frontend/presentation only — no changes to RSVP submission, email, or backend logic.
