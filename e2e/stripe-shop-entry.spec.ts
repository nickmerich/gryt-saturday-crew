import { test, expect } from "@playwright/test";

// A Shopify outage must not hide the independent Stripe purchase path.
// No orders, customer records or payments are created by these checks.
for (const width of [1280, 375]) {
  test(`Stripe purchase link survives Shopify failure at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route("**/api/*/graphql.json", (route) =>
      route.fulfill({ status: 503, body: "Store unavailable" }),
    );
    await page.goto("/shop");
    const stripe = page.getByRole("link", { name: "Buy with Stripe", exact: true });
    await expect(stripe).toBeVisible();
    await expect(stripe).toHaveAttribute("href", "/shop/checkout");
    await expect(
      page.getByText("Shopify checkout is currently unavailable.", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("Online checkout is not available yet.", { exact: false }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Show side wordmark" }).click();
    await expect(page.getByRole("button", { name: "Show side wordmark" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: /Cart, 0 items/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    // Intercept destination to prove navigation without touching a hosted database.
    await page.route("**/shop/checkout", (route) =>
      route.fulfill({ contentType: "text/html", body: "<h1>Hat checkout destination</h1>" }),
    );
    await stripe.click();
    await expect(page).toHaveURL(/\/shop\/checkout$/);
    await expect(page.getByRole("heading", { name: "Hat checkout destination" })).toBeVisible();
  });
}
