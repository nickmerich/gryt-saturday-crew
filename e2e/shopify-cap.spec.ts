import { test, expect } from "@playwright/test";

test("cap review is readable, non-purchasable and preserves the run invitation", async ({
  page,
  baseURL,
}) => {
  expect(["127.0.0.1", "localhost"]).toContain(new URL(baseURL ?? "").hostname);
  for (const width of [375, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/resources#merch", { waitUntil: "domcontentloaded" });
    const cap = page.locator("#merch");
    await expect(cap.getByRole("status")).toHaveText("Shop listing in review");
    await expect(cap.getByText("The Founding Member Cap", { exact: true })).toBeVisible();
    expect(
      await cap
        .locator("img")
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    ).toBe(true);
    await expect(cap.getByRole("link", { name: "View in GRYT Shop" })).toHaveCount(0);
    await expect(cap.getByText(/24 caps|no restock|September|\$36|100% of proceeds/i)).toHaveCount(
      0,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.locator("#merch").getByRole("link", { name: "Come run with us" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/#join$/);
  await expect(page.getByTestId("rsvp-submit")).toBeVisible();
});
