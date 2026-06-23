# Brand alignment pass

The landing page is already in the right visual world (black + baby blue, Space Grotesk + Oswald + Inter, concrete texture, diagonal slashes). What's drifting from the brand system, and what to fix.

## Issues found

1. **Brand name casing in body copy.** The page writes `GRYT` (uppercase) inside sentences ("GRYT is a Pittsburgh run club…", "GRYT started because…", "GRYT gives you…", "GRYT is free."). Brand rule: wordmark is always lowercase `gryt`; uppercase `GRYT` is reserved for the condensed-display poster treatment, never inline in body.
2. **MissionStamp is too small / too quiet.** Currently `text-xs` Oswald with a tiny slash. Brand says it's the recurring north-star stamp on hero, footer, posters — should read as a stacked condensed-display block with a prominent diagonal baby-blue slash under `TOGETHER`.
3. **No condensed-uppercase poster treatment in the hero.** Brand reserves Oswald-700 uppercase for hero callouts/posters/event lines. Hero H1 is fine as Space Grotesk manifesto, but it should be paired with a `GRYT` condensed-uppercase poster lockup somewhere prominent (hero + final CTA), and the section eyebrows that read like event lines (e.g. `SATURDAY · 7 AM`) should use the condensed face, not the Inter eyebrow.
4. **Decorative unicode in CTAs.** "Join the group chat →" uses a right-arrow glyph. Brand rule: no decorative unicode except `©` and `·`. Remove the arrows.
5. **Wordmark outline direction.** Current `.wordmark` uses `text-shadow: 3px 3px 0 var(--blue)` → outline is bottom-**right**. Brand says "offset baby-blue outline visible at bottom-right" — this is correct, keep. But the `.wordmark-ink` variant (black fill on light) is defined and never used; the footer/nav force white fill on dark which is right, so just confirm the rule.
6. **Monogram G is missing.** Brand calls for a `G` monogram (baby-blue on black, lightning-bolt inside) for avatar/favicon/small lockups. The page has no favicon and no monogram lockup. Add an SVG monogram component and wire it as the favicon + a small lockup beside the footer wordmark.
7. **OG image / favicon links.** `__root.tsx` has no `icon` link and no `og:image`. Add favicon (monogram SVG) and an og:image meta pointing at the hero image URL.
8. **"Run", "First Time", etc. nav labels** use Inter eyebrow — fine, but the in-page section H2s mix title case ("Saturday is already planned.") which is on-brand for manifesto, and condensed-uppercase poster blocks (final CTA `SATURDAY · 7 AM · MCMURRAY`). Keep both, just make sure the condensed blocks consistently use `.display-condensed` (they do) at the right scale.

## Changes

### `src/routes/index.tsx`
- Replace every inline-body `GRYT` with lowercase `gryt`. Affected strings:
  - Hero p: "GRYT is a Pittsburgh run club…" → "gryt is a Pittsburgh run club…"
  - CorePromise p: "GRYT gives you one standing appointment…" → "gryt gives you…"
  - Founders p: "GRYT started because we needed it too." / "GRYT isn't about medals." → lowercase
  - FAQ: "GRYT is free." → "gryt is free."
- Rebuild `MissionStamp`: stacked `DO HARD` / `THINGS` / `TOGETHER` in `.display-condensed` at ~`text-2xl` (footer) / `text-4xl` (hero stamp variant), with a wider, thicker baby-blue slash drawn under the `TOGETHER` line (not inline next to it). Accept a `size` prop so footer can use a smaller version.
- Place the `MissionStamp` (large variant) inside the Hero, top-right or above the H1, so it earns its "north star" role.
- Add a `GrytPoster` element (Oswald uppercase, very large `GRYT` with a baby-blue slash through it) inside the FinalCTA section above `SATURDAY · 7 AM · MCMURRAY`.
- Community section CTAs: remove the `→` glyph. Buttons should read `Join the group chat` and `View this week's run`. Keep the styling.
- Add `MonogramG` inline SVG component (baby-blue circle/square on black, white `G` with a lightning bolt cutout). Render it small (24–32px) next to the footer wordmark and inside the Nav as a mobile fallback.

### `src/routes/__root.tsx`
- Add favicon link using an inline SVG data URL of the monogram (or `/favicon.svg` file we create).
- Add `og:image` + `twitter:image` meta pointing at `/og-image.jpg` (use the existing hero image asset path — already a CDN-served import, so reference its URL via the asset import in a small adjustment).

### `src/styles.css`
- Strengthen `.slash` defaults (current 2.5rem × 4px is fine for small inline use). Add a `.slash-lg` modifier (~8rem × 6px, skew −20deg) for the MissionStamp under-rule and the GrytPoster slash.
- No font/color/radius changes — palette and type already match the brand tokens.

### New asset
- `src/assets/monogram-g.svg` — small SVG: black background square, baby-blue `G` glyph with a lightning-bolt notch. Referenced by `MonogramG` and as `/favicon.svg` (or inline data URL in head).

## Out of scope
- No new sections, no copy rewrites beyond the casing fixes above, no layout reshuffles. No imagery swaps. No new dependencies.
