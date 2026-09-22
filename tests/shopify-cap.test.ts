import test from "node:test";
import assert from "node:assert/strict";
import { CAP_BINDING, readCap } from "../src/lib/shopify-cap";

const product = {
  id: CAP_BINDING.productId,
  handle: CAP_BINDING.handle,
  title: "The Founding Member Cap",
  published_at: "2026-09-22T10:00:00-04:00",
  available: true,
  variants: [{ id: CAP_BINDING.variantId, available: true }],
};
const reply = (body: unknown, status = 200) =>
  (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

test("release gate prevents all requests and purchases", async () => {
  assert.equal(CAP_BINDING.releaseApproved, false);
  const state = await readCap(false, async () => {
    throw new Error("Must not request");
  });
  assert.equal(state.status, "review");
  assert.equal(state.productUrl, null);
});
test("approved, published exact product maps to the verified variant", async () => {
  let called = false;
  const state = await readCap(true, async (url, options) => {
    called = true;
    assert.equal(url, `https://${CAP_BINDING.shop}/products/${CAP_BINDING.handle}.js`);
    assert.equal(options?.redirect, "error");
    assert.ok(options?.signal);
    return new Response(JSON.stringify(product));
  });
  assert.ok(called);
  assert.equal(state.status, "available");
  assert.equal(
    state.productUrl,
    `https://${CAP_BINDING.shop}/products/${CAP_BINDING.handle}?variant=${CAP_BINDING.variantId}`,
  );
  assert.equal("price" in state, false);
});
for (const [name, body] of [
  ["wrong product", { ...product, id: 123 }],
  ["wrong handle", { ...product, handle: "another-cap" }],
  ["missing variant", { ...product, variants: [] }],
  ["unpublished", { ...product, published_at: null }],
  ["malformed", {}],
] as const) {
  test(`${name} cannot expose a purchase link`, async () => {
    assert.equal((await readCap(true, reply(body))).status, "unavailable");
  });
}
test("unavailable product or exact variant suppresses purchase links", async () => {
  for (const body of [
    { ...product, available: false },
    { ...product, variants: [{ id: CAP_BINDING.variantId, available: false }] },
  ]) {
    assert.deepEqual(await readCap(true, reply(body)), {
      status: "sold_out",
      title: product.title,
      productUrl: null,
    });
  }
});
test("404, rate limit and server failures fail closed", async () => {
  for (const status of [404, 429, 500]) {
    assert.equal((await readCap(true, reply({}, status))).productUrl, null);
  }
});
test("network errors and non-JSON storefront pages fail closed", async () => {
  const failure = (async () => {
    throw new Error("Offline");
  }) as typeof fetch;
  const html = (async () => new Response("<html>Store password</html>")) as typeof fetch;
  for (const request of [failure, html]) {
    assert.equal((await readCap(true, request)).status, "unavailable");
  }
});
