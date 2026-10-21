/**
 * Shopify Storefront API (public, read + cart only). The storefront token is a
 * publishable key. No admin credential, participant data, RSVP or waiver
 * information is ever sent through here.
 */
import { CAP_BINDING } from "./shopify-cap";

export const SHOPIFY_API_VERSION = "2026-10";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = CAP_BINDING.shopDomain;
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "a3f6af19e9bdcbb3ab9ef6f20c089c95";

export class ShopifyBillingError extends Error {}

export async function storefrontApiRequest<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 402) throw new ShopifyBillingError("Shopify plan required");
  if (!response.ok) throw new Error(`Shopify HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors?.length) {
    throw new Error(data.errors.map((e: { message: string }) => e.message).join(", "));
  }
  return data as T;
}

export type CapVariant = {
  variantId: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  quantityAvailable: number | null;
  imageUrl: string | null;
  productTitle: string;
};

const CAP_VARIANT_QUERY = `
  query CapVariant($id: ID!) {
    node(id: $id) {
      ... on ProductVariant {
        id
        title
        availableForSale
        quantityAvailable
        price { amount currencyCode }
        image { url }
        product { id title featuredImage { url } }
      }
    }
  }
`;

/**
 * Reads the one approved variant. Returns null when Shopify does not expose
 * it to the storefront (draft, unpublished, deleted) or identity mismatches.
 */
export async function fetchCapVariant(): Promise<CapVariant | null> {
  const data = await storefrontApiRequest<{ data: { node: any } }>(CAP_VARIANT_QUERY, {
    id: CAP_BINDING.variantGid,
  });
  const node = data?.data?.node;
  if (!node || node.id !== CAP_BINDING.variantGid) return null;
  if (node.product?.id !== CAP_BINDING.productGid) return null;
  return {
    variantId: node.id,
    title: node.title,
    price: node.price,
    availableForSale: Boolean(node.availableForSale),
    quantityAvailable: typeof node.quantityAvailable === "number" ? node.quantityAvailable : null,
    imageUrl: node.image?.url ?? node.product?.featuredImage?.url ?? null,
    productTitle: node.product?.title ?? "The Founding Member Cap",
  };
}

/* ---------------------------------- cart --------------------------------- */

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;

const LINES = `lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }`;

const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl ${LINES} }
      userErrors { field message }
    }
  }
`;
const CART_LINES_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id ${LINES} }
      userErrors { field message }
    }
  }
`;
const CART_LINES_UPDATE = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;
const CART_LINES_REMOVE = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

type UserError = { field: string[] | null; message: string };

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function cartMissing(errors: UserError[]): boolean {
  return errors.some((e) => {
    const m = e.message.toLowerCase();
    return m.includes("cart not found") || m.includes("does not exist");
  });
}

export async function createShopifyCart(variantId: string, quantity: number) {
  const data = await storefrontApiRequest<any>(CART_CREATE, {
    input: { lines: [{ quantity, merchandiseId: variantId }] },
  });
  const errors: UserError[] = data?.data?.cartCreate?.userErrors ?? [];
  if (errors.length) throw new Error(errors[0]!.message);
  const cart = data?.data?.cartCreate?.cart;
  const lineId = cart?.lines?.edges?.[0]?.node?.id;
  if (!cart?.checkoutUrl || !lineId) return null;
  return { cartId: cart.id as string, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId: lineId as string };
}

export async function addLineToShopifyCart(cartId: string, variantId: string, quantity: number) {
  const data = await storefrontApiRequest<any>(CART_LINES_ADD, {
    cartId,
    lines: [{ quantity, merchandiseId: variantId }],
  });
  const errors: UserError[] = data?.data?.cartLinesAdd?.userErrors ?? [];
  if (cartMissing(errors)) return { success: false, cartNotFound: true } as const;
  if (errors.length) throw new Error(errors[0]!.message);
  const edges = data?.data?.cartLinesAdd?.cart?.lines?.edges ?? [];
  const line = edges.find((l: any) => l.node.merchandise.id === variantId);
  return { success: true, lineId: (line?.node?.id as string) ?? null } as const;
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest<any>(CART_LINES_UPDATE, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  const errors: UserError[] = data?.data?.cartLinesUpdate?.userErrors ?? [];
  if (cartMissing(errors)) return { success: false, cartNotFound: true } as const;
  if (errors.length) throw new Error(errors[0]!.message);
  return { success: true } as const;
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest<any>(CART_LINES_REMOVE, { cartId, lineIds: [lineId] });
  const errors: UserError[] = data?.data?.cartLinesRemove?.userErrors ?? [];
  if (cartMissing(errors)) return { success: false, cartNotFound: true } as const;
  if (errors.length) throw new Error(errors[0]!.message);
  return { success: true } as const;
}

export async function cartStillOpen(cartId: string): Promise<boolean | null> {
  const data = await storefrontApiRequest<any>(CART_QUERY, { id: cartId });
  if (!data) return null;
  const cart = data?.data?.cart;
  return Boolean(cart && cart.totalQuantity > 0);
}
