# GRYT Hat Shopify Connection Review

September 22, 2026 | Review branch only

## Scope

This is an additive product-page handoff from the existing Lovable website to Shopify, not a Shopify theme build or a headless cart. The website’s Stripe donation/event flows, attendance ledger, RSVP, waiver and organizer permissions remain separate.

## Verified catalog binding

The connected store is Gryt Shop, `cidbxi-3p.myshopify.com`, on Basic with USD currency; the matching product remains DRAFT ([Shopify product](https://cidbxi-3p.myshopify.com/admin/products/8670076829868)).

| Field | Verified value |
|---|---|
| Product | The Founding Member Cap |
| Product GID | `gid://shopify/Product/8670076829868` |
| Handle | `the-founding-member-cap` |
| Variant GID | `gid://shopify/ProductVariant/46801296982188` |
| SKU | `GRYT-FM-CAP-01` |
| Current draft price | USD 36.00, not endorsed as the launch price |
| Current recorded inventory | 24, not verified as current physical stock |
| Website release gate | `false` |

The price, inventory and identity above came from the current Shopify product read, not the historical planning notes ([Shopify product](https://cidbxi-3p.myshopify.com/admin/products/8670076829868)).

## Conflicts deliberately not carried into public copy

The Shopify draft still includes “24 caps,” hand-numbering, no-restock language, back-strap specifications and attendance-tier access windows; those terms have not been reconfirmed for this release ([Shopify product](https://cidbxi-3p.myshopify.com/admin/products/8670076829868)).

The new user photos visibly show a dark cap with light embroidery and blue brim trim. A historical yellow-trim concept is not authority to recolor those photos, and a photographed sample is not proof of the sellable inventory version.

The old website merch grid had unverified seasonal drops, multiple placeholder products and a “100% of proceeds” claim. This branch replaces that block with a single cap reference and an honest review state.

## Implemented

- **Identity:** Fixed store, handle, product and variant IDs in `src/lib/shopify-cap.ts`.
- **Release control:** `releaseApproved=false` prevents network reads and purchase links. Shopify publication alone does not unlock the website.
- **Public read:** After approval, a server function reads only the fixed storefront product endpoint and validates the product/variant identity and availability.
- **Failure behavior:** Draft/unpublished payloads, missing variants, wrong IDs, errors, invalid JSON, redirects and unavailable stock never expose a purchase link.
- **Checkout ownership:** The available state links to the actual Shopify product page with the verified variant selected. No purchase, payment or cart mutation happens in the GRYT website.
- **Data minimization:** No Admin credential, participant identity, RSVP contact or waiver data is sent to Shopify by this code.
- **Imagery:** Metadata-free WebP derivative of IMG_6511.jpeg, 1000 × 1077, about 99 KB, for the private website review. Original remains unchanged.
- **Copy:** No price, stock counter, unverified product specifications, fake waitlist or em dashes.

The public product endpoint is documented by Shopify; its money values depend on presentment currency, so this initial handoff deliberately leaves pricing and checkout on the merchant storefront rather than copying a possibly mismatched amount ([Shopify Product API](https://shopify.dev/docs/api/ajax/reference/product)).

## Editability and preserved surfaces

| Surface | Where maintained | State |
|---|---|---|
| Actual product, price, stock, fulfillment | Shopify product/admin | No changes made |
| Website title after release | Verified public product response | Live read once release is approved |
| Review title and supporting copy | `CapDrop.tsx` / `shopify-cap.ts` | Code-managed, not a new CMS |
| Review photo | `public/images/gryt-cap-detail.webp` | Code-managed derivative |
| Product identity and release approval | `CAP_BINDING` | Reviewed configuration |
| Shopify theme, apps and pixels | Existing Shopify environment | Not inspected or changed; no theme writes required |
| Attendance and event/donation checkout | Existing app implementation | Preserved |

## What remains before selling

1. Confirm that the photographed blue-trim cap is the exact version to sell under this product.
2. Approve corrected draft copy and the specific images to attach. The current connector image-update tool accepts public HTTPS image URLs, not local attachments; no photos were uploaded to Shopify in this pass.
3. Reconcile sale price and usable physical stock. Do not silently choose an older $30 plan or the present draft’s $36 amount.
4. Confirm shipping/pickup, tax, returns, payment readiness and any access rules in Shopify.
5. Publish the approved product to its intended Shopify sales channel only with explicit authorization.
6. Verify the real public product page and product JSON, including product/variant identity and current purchase availability. No draft checkout has been tested.
7. Separately approve and change the website release gate, then test the handoff in staging. Do not merge or deploy production without approval.
8. Review a real checkout without submitting payment or creating an order unless specifically authorized.

## Proposed Shopify description, not saved to the product

> A little GRYT for the miles ahead.
>
> A dark cap with an embroidered GRYT crest and blue trim along the brim. Something to take along for the run, the walk home and the rest of your day.
>
> You do not need the gear to be part of the crew.

This deliberately leaves out fabric, fit, back-strap details, numbered editions, restock policy, price, inventory and eligibility rules until the owner confirms them. Approving this text does not by itself approve changing product status or publishing photos.

## QA coverage

The ten new unit tests pass and cover the release-locked state, exact identity mapping, missing/wrong identity, unpublished data, unavailable variants, HTTP failures, invalid JSON and network failures. The browser scenario passes at 375px, 390px and 1440px and checks the visible draft state, cap image, hidden purchase link, absence of stale claims, mobile fit and keyboard navigation back to RSVP.

The existing 28 attendance tests, typecheck, copy check and production build also passed. The build still reports existing deprecation, asset-path and chunk-size warnings; this is not a claim of a warning-free repository. Authored website copy contains zero em dashes.

The browser check uncovered an existing oversized Resources heading at mobile width. Its minimum size was reduced from 84px to 64px, resolving horizontal overflow without hiding content. Desktop and mobile cap screenshots were inspected for legibility, cropping and hierarchy.

Synthetic available-state tests validate code behavior only. They are not proof that this draft is published or that an actual checkout works.

## Rollback and boundaries

Revert this cap integration commit on the review branch to restore the earlier resources layout. Keep `releaseApproved=false` to disable the website handoff independently of Shopify.

No Shopify theme, product fields, price, inventory, images, publication state, collection, payment, order or notification was changed. Nothing was posted to social media or deployed to grytrunclub.com.
