/**
 * Fixed, reviewed binding between the GRYT website and one Shopify product.
 *
 * This is an additive handoff: the website never mutates a cart, never takes a
 * payment and never sends participant data to Shopify. Purchase, price,
 * inventory and fulfillment stay on the merchant storefront.
 *
 * Shopify publication alone does NOT unlock the website surface.
 * `releaseApproved` must be flipped deliberately, in code, after review.
 */
export const CAP_BINDING = {
  shopDomain: "cidbxi-3p.myshopify.com",
  handle: "gryt-club-running-hat",
  editionSize: 100,
  productGid: "gid://shopify/Product/8670076829868",
  variantGid: "gid://shopify/ProductVariant/46801296982188",
  productId: 8670076829868,
  variantId: 46801296982188,
  sku: "GRYT-FM-CAP-01",
  /** Website release gate. Owner approved selling on 2026-09-22. */
  releaseApproved: true,
} as const;

export const CAP_PRODUCT_JSON_URL = `https://${CAP_BINDING.shopDomain}/products/${CAP_BINDING.handle}.js`;

/** Product page with the verified variant preselected. Shopify owns checkout. */
export const CAP_PRODUCT_URL = `https://${CAP_BINDING.shopDomain}/products/${CAP_BINDING.handle}?variant=${CAP_BINDING.variantId}`;

export type CapState =
  | { state: "release-locked" }
  | { state: "unavailable"; reason: string }
  | {
      state: "available";
      title: string;
      productUrl: string;
      /** Formatted from the storefront payload. Null when the payload has no usable price. */
      price: string | null;
      /** Absolute https image URL from the storefront payload, or null. */
      imageUrl: string | null;
    };

/** Shopify product .js prices are integer cents in the shop's presentment currency. */
function formatCents(value: unknown): string | null {
  const cents = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

function absoluteImage(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const url = value.startsWith("//") ? `https:${value}` : value;
  return url.startsWith("https://") ? url : null;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Reads only the fixed public product endpoint and validates identity.
 * Any mismatch, error or unavailable variant fails closed: no purchase link.
 */
export async function readCapProduct(
  fetchImpl: FetchLike = fetch,
  binding: { releaseApproved: boolean } = CAP_BINDING,
): Promise<CapState> {
  if (!binding.releaseApproved) return { state: "release-locked" };

  let payload: any;
  try {
    const res = await fetchImpl(CAP_PRODUCT_JSON_URL, {
      redirect: "error",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { state: "unavailable", reason: `http_${res.status}` };
    payload = await res.json();
  } catch {
    return { state: "unavailable", reason: "request_failed" };
  }

  if (!payload || typeof payload !== "object") {
    return { state: "unavailable", reason: "invalid_payload" };
  }
  if (Number(payload.id) !== CAP_BINDING.productId) {
    return { state: "unavailable", reason: "product_identity_mismatch" };
  }
  if (payload.handle && payload.handle !== CAP_BINDING.handle) {
    return { state: "unavailable", reason: "handle_mismatch" };
  }
  if (payload.published_at === null || payload.available === false) {
    return { state: "unavailable", reason: "not_published" };
  }

  const variants = Array.isArray(payload.variants) ? payload.variants : [];
  const variant = variants.find(
    (v: any) => Number(v?.id) === CAP_BINDING.variantId,
  );
  if (!variant) return { state: "unavailable", reason: "variant_not_found" };
  if (variant.available !== true) {
    return { state: "unavailable", reason: "variant_unavailable" };
  }

  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : "The Founding Member Cap";

  const price = formatCents(variant.price) ?? formatCents(payload.price);
  const imageUrl =
    absoluteImage(variant.featured_image?.src) ??
    absoluteImage(payload.featured_image) ??
    absoluteImage(Array.isArray(payload.images) ? payload.images[0] : null);

  return {
    state: "available",
    title,
    productUrl: CAP_PRODUCT_URL,
    price,
    imageUrl,
  };
}
