import { describe, expect, test } from "bun:test";
import {
  CAP_BINDING,
  CAP_PRODUCT_URL,
  readCapProduct,
} from "../src/lib/shopify-cap";

const APPROVED = { releaseApproved: true };

function jsonResponse(body: unknown, status = 200) {
  return async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
}

const validPayload = {
  id: CAP_BINDING.productId,
  handle: CAP_BINDING.handle,
  title: "The Founding Member Cap",
  published_at: "2026-09-01T00:00:00Z",
  available: true,
  price: 3600,
  featured_image: "//cdn.shopify.com/s/files/1/cap.jpg",
  variants: [{ id: CAP_BINDING.variantId, available: true, price: 3600 }],
};

describe("cap release gate", () => {
  test("gate is owner-approved and explicit", () => {
    expect(typeof CAP_BINDING.releaseApproved).toBe("boolean");
    expect(CAP_BINDING.releaseApproved).toBe(true);
  });

  test("release-locked never hits the network", async () => {
    let called = false;
    const state = await readCapProduct(async () => {
      called = true;
      return new Response("{}");
    }, { releaseApproved: false });
    expect(state.state).toBe("release-locked");
    expect(called).toBe(false);
  });
});

describe("cap identity validation", () => {
  test("exact identity match yields an available purchase handoff", async () => {
    const state = await readCapProduct(jsonResponse(validPayload), APPROVED);
    expect(state).toEqual({
      state: "available",
      title: "The Founding Member Cap",
      productUrl: CAP_PRODUCT_URL,
      price: "$36.00",
      imageUrl: "https://cdn.shopify.com/s/files/1/cap.jpg",
    });
  });

  test("missing price and image degrade to nulls, not fake values", async () => {
    const state = await readCapProduct(
      jsonResponse({
        ...validPayload,
        price: null,
        featured_image: null,
        variants: [{ id: CAP_BINDING.variantId, available: true }],
      }),
      APPROVED,
    );
    expect(state).toEqual({
      state: "available",
      title: "The Founding Member Cap",
      productUrl: CAP_PRODUCT_URL,
      price: null,
      imageUrl: null,
    });
  });

  test("wrong product id fails closed", async () => {
    const state = await readCapProduct(
      jsonResponse({ ...validPayload, id: 1 }),
      APPROVED,
    );
    expect(state).toEqual({ state: "unavailable", reason: "product_identity_mismatch" });
  });

  test("wrong handle fails closed", async () => {
    const state = await readCapProduct(
      jsonResponse({ ...validPayload, handle: "some-other-cap" }),
      APPROVED,
    );
    expect(state).toEqual({ state: "unavailable", reason: "handle_mismatch" });
  });

  test("unpublished (draft) product fails closed", async () => {
    const state = await readCapProduct(
      jsonResponse({ ...validPayload, published_at: null }),
      APPROVED,
    );
    expect(state).toEqual({ state: "unavailable", reason: "not_published" });
  });

  test("missing variant fails closed", async () => {
    const state = await readCapProduct(
      jsonResponse({ ...validPayload, variants: [{ id: 999, available: true }] }),
      APPROVED,
    );
    expect(state).toEqual({ state: "unavailable", reason: "variant_not_found" });
  });

  test("sold out variant fails closed", async () => {
    const state = await readCapProduct(
      jsonResponse({
        ...validPayload,
        variants: [{ id: CAP_BINDING.variantId, available: false }],
      }),
      APPROVED,
    );
    expect(state).toEqual({ state: "unavailable", reason: "variant_unavailable" });
  });
});

describe("cap transport failures", () => {
  test("http error fails closed", async () => {
    const state = await readCapProduct(jsonResponse({}, 404), APPROVED);
    expect(state).toEqual({ state: "unavailable", reason: "http_404" });
  });

  test("invalid json fails closed", async () => {
    const state = await readCapProduct(
      async () => new Response("<html>nope</html>", { status: 200 }),
      APPROVED,
    );
    expect(state).toEqual({ state: "unavailable", reason: "request_failed" });
  });

  test("network failure fails closed", async () => {
    const state = await readCapProduct(async () => {
      throw new Error("ECONNRESET");
    }, APPROVED);
    expect(state).toEqual({ state: "unavailable", reason: "request_failed" });
  });
});
