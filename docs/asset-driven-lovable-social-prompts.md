# GRYT Asset-Driven Lovable and Social Prompt Pack

September 22, 2026 | Drafts for review, not publication

These prompts use the 21 uploaded files as specific references, not a generic mood board. The clean blue-black artwork leads the website direction, real cap photos lead product storytelling, and original running footage supports short-form edits.

## Asset selection and roles

Filenames below match the attachments. Keep the originals unchanged; create separate crops and exports, and remove location/device metadata from distribution copies.

| File | What is visible | Role and recommended use |
|---|---|---|
| IMG_7509.jpeg | Blue-black texture, supplied crest, outlined “DO HARD THINGS” and solid “TOGETHER” | Primary website and campaign style reference. Do not use the entire poster as a flattened webpage. |
| IMG_7494.jpeg | Blue-black abstract texture without the campaign type | Decorative background source. No factual or product claims. |
| IMG_7573.jpeg | Campaign graphic with arrows, circles, heart and other drawn marks | Optional social-only accent reference. Do not carry all the doodles into the cleaner website. |
| IMG_6511.jpeg | Close-up of embroidered crest, dark cap and blue brim trim | Main cap detail reference. Preserve the embroidery, seams and actual color. Website review uses an optimized copy. |
| IMG_6500.jpeg | Side view of the cap, small lowercase side lettering and wearer | Secondary product angle. Preserve original photo; publication needs permission from the depicted person. |
| IMG_6517.jpeg | Front cap view with crest and blue trim | Strong second product-detail frame. No claims about fabric, dimensions or unseen back strap. |
| IMG_6516.jpeg | Outdoor side/front cap crop | Carousel detail alternative, not a second colorway. |
| IMG_6501.jpeg | Front cap view in an indoor setting | Behind-the-scenes product-story alternative. |
| IMG_6515.jpeg | Monochrome cap/wearer close-up | Editorial option, not authoritative color evidence. |
| IMG_6483.jpeg | Cap worn indoors with bright running clothes | Original-photo lifestyle context. Do not identify the person or invent a quote. |
| IMG_6484.jpeg | Similar vertically framed indoor cap portrait | Story crop alternative. Do not treat this as a separate product variant. |
| IMG_6493.jpeg | Cap worn outside at night | Night-run editorial context, not proof of an official club event or reflective performance. |
| IMG_7288.jpeg | Daytime outdoor portrait wearing a cap | Founder/runner-style storytelling only after identity and permission are confirmed. |
| IMG_6551.jpeg | Wearer at an outdoor track | Training context. Do not infer an event, attendance, performance result or venue partnership. |
| IMG_6539.jpeg | Track, scoreboard, sky and field surroundings | Quiet environment frame. Do not label a specific venue from the image alone. |
| IMG_7591.jpeg | Track/field viewed from seating | Negative-space background for a short invitation, not meeting-point evidence. |
| od_photo-1960_singular_display_fullPicture.jpeg | Bridge structure, railing and water | Local-feeling environment frame. Do not invent the bridge name or route. |
| IMG_6487.mov | Dark vertical running/selfie footage, about 17.36 seconds | Raw source for a short running edit. Select visible frames; do not fabricate brighter action or companions. Audio has not been reviewed. |
| IMG_6488.mov | Short vertical nighttime running/selfie footage, about 4.67 seconds | Brief motion insert. Original footage only; audio has not been reviewed. |
| IMG_7679.jpeg | Virlo app screenshot with trial/account interface | Internal inspiration/context only. Exclude from website, hat imagery and social marketing. |
| photo-1937_singular_display_fullPicture.jpeg | Personal indoor scene with people and household objects | Exclude from this campaign. No clear brand or product purpose. |

### Shared production rules

- **Product fidelity:** These cap references show a dark cap, light crest embroidery and blue brim trim. Do not recolor them to match a historical yellow-trim concept or manufacture an unseen back view.
- **Brand fidelity:** Use the existing approved website crest asset. Do not redraw, trace or regenerate the bear from a photo or poster.
- **People:** Use original photographs and footage as supplied, only with permission for the intended channel. No face swaps, body edits, synthetic testimonials, invented identities or generated scenes featuring these people.
- **Copy:** Casual, direct, welcoming and specific. No em dashes. No unsupported counts, performance claims, numbered editions, sellout pressure, partnerships or testimonials.
- **Format:** Website text remains HTML. Social type is added as an editable design layer rather than baked into an AI-generated image.
- **Hierarchy:** The run is the invitation; the hat is optional. No purchase, paid membership or Strava requirement to attend.

## Lovable prompt: extend the clean visual direction

Attach IMG_7509.jpeg, IMG_7494.jpeg and IMG_7573.jpeg. The third file is a secondary social reference, not the homepage direction.

```text
Work in the existing grytrunclub.com project, on the existing review branch.
Do not create a new app or publish to production.

Inspect the current implementation first. The review branch already includes
the clean hero, two existing hero variants, canonical Saturday event details,
RSVP/waiver behavior, utility sections and private organizer attendance tools.
Preserve them. Do not reset the homepage from scratch.

Reference priority:
1. IMG_7509: clean hierarchy, blue-black grain, restrained crest.
2. IMG_7494: decorative texture only.
3. IMG_7573: optional social accents only. Do not reproduce the doodle frame
   across the website.

Keep Oswald display and Inter body roles, the existing approved crest, and
the current documented web blue token. Do not recolor the actual cap or logo.
Use live outlined type for DO HARD THINGS and solid type for TOGETHER where
the existing hero variant already uses that language. Keep the other hero
variant and its assignment logic intact.

Maintain one clear primary action: RSVP Saturday. Use the existing canonical
event model for dates, time, status and location. Keep practical details on a
quiet, readable surface. Do not place body copy over noisy photography.

Treat texture as decorative with no screen-reader announcement. Lazy-load
below-fold imagery, include image dimensions, use optimized assets, preserve
keyboard focus and reduced-motion support. Do not add autoplay video.

Do not add statistics, venue claims, new integrations, synthetic members,
stock countdowns, testimonial quotes or em dashes.

Verify 375px, 390px and 1440px layouts, keyboard RSVP navigation, both hero
variants, error states and no horizontal overflow. Return changed files,
actual test results and a review preview. Do not publish or send anything.
```

## Lovable prompt: the Shopify cap connection

Attach IMG_6511.jpeg, IMG_6500.jpeg and IMG_6517.jpeg. Keep them as real product/lifestyle references rather than generating a new version of the hat.

The connected Shopify catalog contains a single matching cap product, currently a draft, with the identity below. Its current draft data is not an approved launch offer ([Shopify product](https://cidbxi-3p.myshopify.com/admin/products/8670076829868)).

```text
Extend the current review implementation. First inspect:
- src/components/site/CapDrop.tsx
- src/lib/shopify-cap.ts
- src/lib/shopify-cap.functions.ts
- src/routes/resources.tsx
- tests/shopify-cap.test.ts
- e2e/shopify-cap.spec.ts

Reuse this product, not a duplicate:
Store: cidbxi-3p.myshopify.com
Product GID: gid://shopify/Product/8670076829868
Variant GID: gid://shopify/ProductVariant/46801296982188
Handle: the-founding-member-cap
SKU: GRYT-FM-CAP-01
Current verified state: DRAFT

The review branch replaces the placeholder merch grid at /resources#merch
with a real cap reference and a guarded Shopify product-page handoff.
Do not replace Stripe event/donation flows with Shopify.

Preserve releaseApproved=false until the owner approves the actual product,
photography, sale terms and release. Shopify publication alone must not
automatically unlock this website.

The new server read requests the fixed store's public product JSON only after
release approval. It verifies the exact product ID, handle, publication data
and exact variant availability. It fails closed on redirects, failures,
malformed data, missing variants and unavailable products.

In review show:
Eyebrow: Shop listing in review
Heading: The Founding Member Cap
Body: A little GRYT for the miles ahead. You do not need the gear to be part
of the crew.
Status: The cap listing is not open for orders. We will share the shop details
when they are ready.
Secondary action: Come run with us, linking to /#join.

Do not show a price, inventory counter, drop date or Buy button in review.
Do not show a fake waitlist or repurpose RSVP consent for marketing.

After separate approval and storefront verification, the available state
may offer View in GRYT Shop using the exact product/variant URL. Shopify owns
current pricing, inventory, shipping, tax and checkout. The website is not a
headless cart, Admin API sync or order-management system.

Use the supplied real cap photos. Preserve the actual embroidery and blue
trim. Keep the current photo-reference label until the exact sellable version
is confirmed. No regenerated logo, new product angle or invented fabric spec.

Run unit tests and browser checks, including unavailable and unpublished
states. No Admin credentials in frontend code. No production publishing,
theme changes, inventory edits, discounts, order creation or payments.
```

## Lovable prompt: editorial photo placement

Attach IMG_7591.jpeg, od_photo-1960_singular_display_fullPicture.jpeg and one permitted original cap/lifestyle photo.

```text
Add at most one quiet editorial photo moment to the existing review page.
Do not scatter the entire upload across the website.

Use the track/field or bridge photo as environment, not proof of the next
meeting point. Do not name the venue or bridge unless an approved record
confirms it. Do not imply a school, venue or brand partnership.

Keep the photo separate from the next-run location block. Use a simple caption
such as "A little room to keep going." Do not invent when or where the photo
was taken. If that caption does not fit the actual crop, omit it.

Use the original photo, not a synthetic recreation. Optimize with metadata
removed, descriptive alt text and fixed dimensions. No autoplay carousel.
People may appear only in images cleared for this use; no likeness edits.

Keep RSVP primary and cap merchandising secondary. Do not touch auth,
attendance, organizer tools or production configuration.
Return one desktop and one mobile preview for approval.
```

## Social prompt: the clean manifesto

**Purpose:** Brand recognition and the invitation to join, not hat sales.

**Attach:** IMG_7509.jpeg and IMG_7494.jpeg. Create a 1080 × 1350 feed layout and a separately composed 1080 × 1920 Story layout.

```text
Create an editable GRYT social layout from the supplied original artwork.
Use the existing blue-black texture, approved supplied crest and restrained
outlined display type. Preserve the identity rather than redesigning it.

Exact headline:
DO HARD THINGS
TOGETHER.

Keep DO HARD THINGS outlined and TOGETHER solid white. Do not add another
headline or doodle border. Leave generous clear space around the crest.
The optional supporting line is "You do not have to do it alone."

Use real text layers and an unchanged logo asset. Keep essential Story text
out of the top and bottom interface areas; inspect the final platform preview.
Do not include dates, distances, people counts, prices or product scarcity.
```

Caption draft:

> You do not have to do it alone.
>
> Bring the version of you that can show up today. There is room for that here.
>
> Find the next run at grytrunclub.com.

Alt-text draft: “GRYT graphic with outlined ‘Do hard things’ and solid ‘Together’ lettering on a blue-black textured background.”

## Social prompt: the cap, up close

**Purpose:** Product interest while the listing is still in review.

**Attach:** IMG_6511.jpeg, IMG_6500.jpeg and IMG_6517.jpeg. Create a three-frame 1080 × 1350 carousel using original images.

```text
Build a three-frame GRYT cap carousel from these exact photographs.
Frame 1: IMG_6511, close-up crest and brim. Small text: "A LITTLE GRYT."
Frame 2: IMG_6500, original side view. Small text: "FOR THE MILES AHEAD."
Frame 3: IMG_6517, original front detail. Small text: "YOU DO NOT NEED THE
GEAR TO BE PART OF THE CREW."

Use quiet black/white type areas and restrained blue accents. Preserve the
cap's real color, trim, embroidery and silhouette. No logo redrawing, extra
product angles, face changes, new people or simulated wear tests.

Do not show a price, Buy now, preorder, waitlist, numbered edition, stock
quantity or release date. The Shopify product remains a draft.
Do not turn a visible trim color into a technical performance claim.
```

Caption draft:

> A little GRYT for the miles ahead.
>
> A closer look at the cap. We are working through the shop details before opening it up.
>
> In the meantime, you do not need the gear to come run.

Alt text should describe each actual angle. Do not label someone “Nick” or a “member” unless identity and publication permission are confirmed.

## Social prompt: a short running edit

**Purpose:** A human, low-production connection post.

**Attach:** IMG_6487.mov, IMG_6488.mov and IMG_7494.jpeg. Target a 9:16 edit of roughly 10 to 12 seconds.

```text
Edit only the supplied footage. Do not generate a new runner or additional
scenes. Find the clearest visible moments first; the longer clip is very dark.

Proposed cut:
0–3 seconds: clearest original running moment, text "SOME DAYS, JUST START."
3–7 seconds: second original motion clip, text "KEEP SHOWING UP."
7–10 seconds: restrained blue-black end card, text "DO HARD THINGS TOGETHER."
Optional final 1–2 seconds: grytrunclub.com.

Preserve the person, activity and environment. Stabilize and make modest
exposure adjustments only if they preserve the recorded scene. Do not invent
details in the dark footage. If a segment is too dark, cut it rather than
hallucinating a brighter replacement.

Review the original audio before using it. Do not transcribe unheard speech.
Use cleared original sound or properly licensed platform audio. No assumed
rights to commercial music and no music purchase.

Keep captions away from interface controls. Avoid fast flashing or aggressive
transitions. Return an edit draft, not a published Reel.
```

Caption draft:

> Some days, getting out the door is the hard part.
>
> A little movement. A little more room in your head. Keep showing up.

This is editorial copy, not a claim about the depicted person's thoughts or a medical benefit.

## Social prompt: the quieter invitation

**Purpose:** Photo-led running/community content to balance graphic-led posts.

**Attach:** IMG_7591.jpeg or IMG_6539.jpeg, not both. Use one 4:5 feed composition.

```text
Use the original track photograph as a quiet full-frame environment.
Keep the perspective and venue details unchanged. Do not add a crowd, runners,
partner signage or event branding.

Add one short editable line: "MAKE ROOM FOR THE RUN."
Place a small existing GRYT mark in a clear area without covering venue text.
Use generous negative space and the established black, white and blue system.

Do not give a meeting address or imply that the next GRYT run is at this
track. Keep logistical information in the verified website invitation.
```

Caption draft:

> Make room for the run.
>
> Not because every day needs a big result. Sometimes it is enough to get outside and make a little time for yourself.
>
> If you want company, find the next GRYT run at grytrunclub.com.

## Social prompt: the first-time Story

**Purpose:** Help a newcomer take one clear next step.

**Attach:** IMG_7494.jpeg and an approved original running photo. Create three Stories, each 1080 × 1920.

```text
Create an editable three-Story sequence.
Story 1: "FIRST TIME?" on the restrained blue-black texture.
Story 2: "YOU DO NOT HAVE TO KNOW ANYONE." over an original permitted photo,
with text on a quiet readable panel. No added people.
Story 3: "COME RUN WITH US." with space for the platform's actual link sticker.

Use the existing GRYT crest, no redraw. Keep type large and minimal. Leave
Story interface space clear. Do not invent a swipe-up control or draw a
nonfunctional button into the image.

The real link sticker should point to the verified current RSVP destination.
Do not print a stale date, location or time. Before posting, confirm that the
current invitation is accurate and not cancelled.
```

Suggested real sticker text: “Next GRYT run”. The current review implementation’s RSVP anchor is `/#join`; production needs its own link check before use.

## Social prompt: hat launch, held until approved

**Purpose:** A future sales post, not a current announcement.

```text
Do not execute this launch version until the owner approves the sellable cap
version, Shopify listing, current price, usable inventory, fulfillment and
publication. The existing draft is not launch-ready evidence.

Use the approved real cap photos. The headline is "THE GRYT CAP."
The only purchase CTA is "SHOP THE CAP."
Use the current Shopify product page, not a guessed checkout URL.
Do not burn a price or inventory count into the artwork unless it has been
verified for that exact export and approved.

Keep the tone personal and calm. No "only 24", "hand-numbered", "no restock",
free-after-three-runs rule or membership access tiers unless separately
confirmed. No claim that purchase supports a specific beneficiary or that
100% of proceeds are donated.
```

Held caption draft:

> The GRYT cap.
>
> A little something to take along for the miles. Shop details are in the link.
>
> And as always, you do not need the gear to be part of the crew.

Do not use this held version while the product is a draft.

## Suggested sequence

- **First:** Clean manifesto, linking to the verified run invitation.
- **Next:** A permitted original-photo or running edit.
- **Then:** Cap close-up teaser, without purchase language.
- **After that:** First-time Story sequence near the next verified run.
- **Only after release approval:** Hat launch post.

This is a suggested order, not a scheduled campaign. No posts, DMs, emails or SMS have been sent.

## Handoff status

- **Saved:** Full asset selection, three Lovable prompts and six social briefs.
- **Drafted:** Social captions, alt-text guidance and future hat launch copy.
- **Implemented separately:** Review-branch cap section and guarded product identity mapping.
- **Not done:** Social graphic exports, Reel edit, direct execution in Lovable, product-photo uploads to Shopify, product publication or live website release.
- **Excluded:** Virlo screenshot and the unrelated personal photograph.
