import { describe, it, expect } from "vitest";
import {
  supportAmount,
  checkoutInput,
  partnerMethods,
  ticketQuantity,
  hatCheckoutOptions,
  environmentFromToken,
  sessionEnvironment,
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
  it("accepts approved live payments and test payments", () => {
    const input = {
      type: "support",
      environment: "live",
      name: "Test Runner",
      email: "test@example.com",
    };
    expect(checkoutInput.safeParse(input).success).toBe(true);
    expect(checkoutInput.safeParse({ ...input, environment: "sandbox" }).success).toBe(true);
    expect(checkoutInput.safeParse({ ...input, environment: "other" }).success).toBe(false);
  });
  it("selects only the environment identified by the managed token", () => {
    expect(environmentFromToken("pk_live_example")).toBe("live");
    expect(environmentFromToken("pk_test_example")).toBe("sandbox");
    expect(() => environmentFromToken(undefined)).toThrow();
    expect(() => environmentFromToken("invalid")).toThrow();
  });
  it("keeps live and test result sessions separate", () => {
    expect(sessionEnvironment("cs_live_abc123")).toBe("live");
    expect(sessionEnvironment("cs_test_abc123")).toBe("sandbox");
    expect(() => sessionEnvironment("cs_abc123")).toThrow();
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
    expect(options.shipping_options?.[0].shipping_rate_data.fixed_amount).toEqual({
      amount: 0,
      currency: "usd",
    });
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
