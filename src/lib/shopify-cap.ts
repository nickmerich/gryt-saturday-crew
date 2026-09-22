import { z } from "zod";

/** Verified Shopify identity. This is not a price, inventory or release source. */
export const CAP_BINDING = {
  shop: "cidbxi-3p.myshopify.com",
  handle: "the-founding-member-cap",
  productId: 8670076829868,
  variantId: 46801296982188,
  // A separate review is required even if somebody publishes the Shopify draft.
  releaseApproved: false,
} as const;

export type CapState = {
  status: "review" | "available" | "sold_out" | "unavailable";
  title: string;
  productUrl: string | null;
};

const publicProduct = z.object({
  id: z.literal(CAP_BINDING.productId),
  handle: z.literal(CAP_BINDING.handle),
  title: z.string().trim().min(1).max(200),
  published_at: z.string().datetime({ offset: true }),
  available: z.boolean(),
  variants: z.array(z.object({ id: z.number(), available: z.boolean() })),
});

export async function readCap(
  releaseApproved: boolean,
  request: typeof fetch = fetch,
): Promise<CapState> {
  const fallback: CapState = {
    status: releaseApproved ? "unavailable" : "review",
    title: "The Founding Member Cap",
    productUrl: null,
  };
  if (!releaseApproved) return fallback;
  try {
    const base = `https://${CAP_BINDING.shop}/products/${CAP_BINDING.handle}`;
    const response = await request(`${base}.js`, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return fallback;
    const product = publicProduct.parse(await response.json());
    const variant = product.variants.find((v) => v.id === CAP_BINDING.variantId);
    if (!variant) return fallback;
    const available = product.available && variant.available;
    return {
      status: available ? "available" : "sold_out",
      title: product.title,
      productUrl: available ? `${base}?variant=${CAP_BINDING.variantId}` : null,
    };
  } catch {
    return fallback;
  }
}
