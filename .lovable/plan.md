# Make the Runner Resources background stand out

The resources section currently sits on plain flat black, so it reads as filler between two stronger sections. It should feel like a GRYT poster surface — textured, physical, with the baby-blue accent doing real work.

## What changes

Only the background and framing of the "Runner Resources" section on the homepage. Headline, copy, and the two cards keep their current wording, order, and structure.

1. **Textured surface instead of flat black.** Layer a concrete/paper grain over the vintage off-black (#171614) so the panel visibly separates from the pure-black sections above and below.
2. **Diagonal baby-blue slashes.** Two or three wide, low-opacity slashes cutting across the panel at the brand's ~8-degree angle — the same motif used on the posters.
3. **Oversized ghost wordmark.** A very low-opacity `gryt` set large and bled off the right edge, sitting behind the cards.
4. **Hard brand edges.** Baby-blue top and bottom hairlines so the section reads as a distinct poster block rather than a scroll of the same black.
5. **Card contrast tuning.** The featured blue card stays the brightest thing on the panel; the secondary card gets a slightly darker fill so it separates from the new texture instead of disappearing into it.

Everything stays readable at current contrast levels, and the section keeps its behavior on mobile.

## Technical notes

- Add a reusable `@utility grit-panel` in `src/styles.css`: vintage-black base, layered `repeating-linear-gradient` slashes plus an SVG/CSS grain via `&::before`, and blue hairline borders. Nesting pseudo-elements inside the body per Tailwind v4 rules.
- Swap `bg-ink` for that utility on the `ResourcesBlock` section in `src/routes/index.tsx`; keep `relative overflow-hidden` so the ghost wordmark and slashes clip.
- Ghost wordmark as an absolutely positioned `aria-hidden` span using `display-condensed`, `select-none`, low opacity.
- No color hardcoding: use `var(--blue)`, `var(--vintage)`, `var(--paper)` tokens.
