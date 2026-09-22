import { createServerFn } from "@tanstack/react-start";
import { CAP_BINDING, readCap } from "./shopify-cap";

/** Public read only. No Admin key, cart writes, payments or member data. */
export const getCapListing = createServerFn({ method: "GET" }).handler(() =>
  readCap(CAP_BINDING.releaseApproved),
);
