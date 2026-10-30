import { z } from "zod";

export const supportAmount = z.number().int().min(500).max(100000);
export const ticketQuantity = z.number().int().min(1).max(10);
export const paymentEnvironment = z.enum(["sandbox", "live"]);
export function environmentFromToken(token: string | undefined): "sandbox" | "live" {
  if (token?.startsWith("pk_test_")) return "sandbox";
  if (token?.startsWith("pk_live_")) return "live";
  throw new Error("Stripe payments are not configured for this build. Complete Stripe go-live.");
}
export function sessionEnvironment(sessionId: string): "sandbox" | "live" {
  if (/^cs_test_[A-Za-z0-9_]+$/.test(sessionId)) return "sandbox";
  if (/^cs_live_[A-Za-z0-9_]+$/.test(sessionId)) return "live";
  throw new Error("Invalid checkout session.");
}
export const checkoutInput = z
  .object({
    type: z.enum(["support", "merch", "ticket", "partner"]),
    environment: paymentEnvironment,
    amount: z.number().int().min(500).max(10000000).default(2500),
    quantity: ticketQuantity.default(1),
    monthly: z.boolean().default(false),
    itemId: z.uuid().optional(),
    token: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    email: z.email().max(254),
    name: z.string().trim().min(1).max(120),
    fulfillment: z.enum(["shipping", "pickup"]).default("pickup"),
  })
  .refine(
    (data) => data.type !== "support" || supportAmount.safeParse(data.amount).success,
    "Support must be $5 to $1,000.",
  );
export function partnerMethods(cents: number): Array<"card" | "us_bank_account"> {
  return cents > 100000 ? ["card", "us_bank_account"] : ["card"];
}
export function hatCheckoutOptions(fulfillment: "shipping" | "pickup") {
  return {
    automatic_tax: { enabled: true },
    billing_address_collection: "required" as const,
    customer_update: {
      address: "auto" as const,
      ...(fulfillment === "shipping" && { shipping: "auto" as const }),
    },
    ...(fulfillment === "shipping" && {
      shipping_address_collection: { allowed_countries: ["US" as const] },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Free US shipping",
            type: "fixed_amount" as const,
            fixed_amount: { amount: 0, currency: "usd" },
          },
        },
      ],
    }),
  };
}
export function paymentHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | GRYT Run Club` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | GRYT Run Club` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  };
}
export const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
