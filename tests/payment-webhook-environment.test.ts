import { describe, it, expect, vi } from "vitest";
import type Stripe from "stripe";

const state = vi.hoisted(() => ({ filters: [] as Array<[string, unknown]>, receipts: [] as Array<Record<string, unknown>> }));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => {
      const chain = {
        select: () => chain,
        eq: (key: string, value: unknown) => { state.filters.push([key, value]); return chain; },
        single: async () => ({ data: { id: "11111111-1111-1111-1111-111111111111", amount_cents: 1000, status: "paid", type: "support", email: "runner@example.com", item: "Support GRYT" } }),
        upsert: async (receipt: Record<string, unknown>) => { state.receipts.push(receipt); return { error: null }; },
      };
      return chain;
    },
  },
}));
import { recordTestPayment } from "../src/lib/test-payment-webhook.server";
describe("Payment webhook environment isolation", () => {
  it("rejects a live event delivered to the test endpoint", async () => {
    await expect(recordTestPayment({ livemode: true } as Stripe.Event, "sandbox")).rejects.toThrow("environment mismatch");
  });
  it("rejects a test event delivered to the live endpoint", async () => {
    await expect(recordTestPayment({ livemode: false } as Stripe.Event, "live")).rejects.toThrow("environment mismatch");
  });
  it("records a paid live receipt only against the live order", async () => {
    state.filters.length = 0; state.receipts.length = 0;
    await recordTestPayment({ livemode: true, type: "checkout.session.completed", id: "evt_live", data: { object: { id: "cs_live_abc", metadata: { orderId: "11111111-1111-1111-1111-111111111111" }, amount_subtotal: 1000, amount_total: 1000, currency: "usd", payment_status: "paid" } } } as unknown as Stripe.Event, "live");
    expect(state.filters).toContainEqual(["environment", "live"]);
    expect(state.receipts[0]).toMatchObject({ environment: "live", status: "paid", amount: 1000 });
  });
});