import { describe, it, expect } from "vitest";
import {
  supportAmount,
  checkoutInput,
  partnerMethods,
  ticketQuantity,
  hatCheckoutOptions,
} from "../src/lib/test-payment-rules";
describe("Separate payment rules", () => {
  it("allows support presets $10 $25 $50", () => {
    [1000, 2500, 5000].forEach((amount) => expect(supportAmount.parse(amount)).toBe(amount));
  });
  it("requires minimum support $5", () => {
    expect(supportAmount.safeParse(499).success).toBe(false);
    expect(supportAmount.parse(500)).toBe(500);
  });
  it("limits support to $1,000", () => {
    expect(supportAmount.parse(100000)).toBe(100000);
    expect(supportAmount.safeParse(100001).success).toBe(false);
  });
  it("rejects live payments", () => {
    const input = {
      type: "support",
      environment: "live",
      name: "Test Runner",
      email: "test@example.com",
    };
    expect(checkoutInput.safeParse(input).success).toBe(false);
    expect(checkoutInput.safeParse({ ...input, environment: "sandbox" }).success).toBe(true);
  });
  it("defaults support to one time", () => {
    expect(
      checkoutInput.parse({
        type: "support",
        environment: "sandbox",
        name: "Test Runner",
        email: "test@example.com",
      }).monthly,
    ).toBe(false);
  });
  it("only enables ACH above $1,000", () => {
    expect(partnerMethods(100000)).toEqual(["card"]);
    expect(partnerMethods(100001)).toEqual(["card", "us_bank_account"]);
  });
  it("bounds ticket quantity to 1 through 10", () => {
    expect(ticketQuantity.safeParse(0).success).toBe(false);
    expect(ticketQuantity.parse(10)).toBe(10);
    expect(ticketQuantity.safeParse(11).success).toBe(false);
  });
  it("offers free US-only shipping and saves the checkout shipping address", () => {
    const options = hatCheckoutOptions("shipping");
    expect(options.shipping_address_collection?.allowed_countries).toEqual(["US"]);
    expect(options.shipping_options?.[0].shipping_rate_data.fixed_amount).toEqual({ amount: 0, currency: "usd" });
    expect(options.customer_update.shipping).toBe("auto");
  });
  it("keeps Saturday pickup free without collecting a shipping address", () => {
    const options = hatCheckoutOptions("pickup");
    expect(options.shipping_address_collection).toBeUndefined();
    expect(options.shipping_options).toBeUndefined();
  });
  it("calculates applicable hat tax for both delivery choices", () => {
    expect(hatCheckoutOptions("pickup").automatic_tax.enabled).toBe(true);
    expect(hatCheckoutOptions("shipping").automatic_tax.enabled).toBe(true);
  });
});
