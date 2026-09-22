import { createServerFn } from "@tanstack/react-start";
import { readCapProduct, type CapState } from "@/lib/shopify-cap";

/**
 * Public read of the fixed Shopify product endpoint. No credentials, no
 * participant data, no cart or payment calls. Fails closed to a review state.
 */
export const getCapState = createServerFn({ method: "GET" }).handler(
  async (): Promise<CapState> => readCapProduct(),
);
