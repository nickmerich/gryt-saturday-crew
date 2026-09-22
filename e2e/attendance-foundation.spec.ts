import { test, expect } from "@playwright/test";
import { runOnDate } from "../src/lib/run-occurrence";

test("clean visual direction preserves both hero variants and mobile attendance actions", async ({
  page,
}) => {
  for (const variant of ["a", "b"]) {
    for (const width of [375, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?v=${variant}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("#top")).toHaveAttribute("data-hero-variant", variant);
      await expect(page.locator("#top")).toHaveAttribute(
        "data-visual-direction",
        "clean-blue-2026-09",
      );
      await expect(page.locator("#top h1")).toContainText(
        variant === "a" ? "ATHLETIC PARENTS." : "together.",
      );
      await expect(page.locator("#top h1 .gryt-outline")).toBeVisible();
      await expect(page.locator("#top .gryt-clean-next")).toContainText("Valley Brook");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width < 768) await expect(page.getByTestId("mobile-run-action")).toBeVisible();
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#top .btn-primary").focus();
  expect(
    await page.locator("#top .btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe("none");
  await page.locator("#top .btn-primary").press("Enter");
  await expect(page).toHaveURL(/#join$/);
  await expect(page.getByTestId("rsvp-submit")).toBeEnabled();
});

// These tests are deliberately local-only. Never submit fixtures to production.
test.beforeEach(async ({ page, baseURL }) => {
  const host = new URL(baseURL ?? "").hostname;
  expect(["127.0.0.1", "localhost"]).toContain(host);
  await page.route("**/api/public/rsvp", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Fixture storage unavailable. Your RSVP was not saved." }),
    }),
  );
  // Existing external embeds are unrelated to attendance tests.
  await page.route("**/strava.com/**", (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

test("validation and storage failure never show saved state", async ({ page }) => {
  await page.getByTestId("rsvp-submit").click();
  await expect(
    page.getByText("Add your name and a valid email or phone to save your RSVP."),
  ).toBeVisible();
  await page.getByLabel("First name", { exact: true }).fill("Local Fixture");
  await page.getByLabel("Email or phone", { exact: true }).fill("fixture@example.com");
  await page.getByTestId("rsvp-submit").click();
  await expect(
    page.getByText("Fixture storage unavailable. Your RSVP was not saved."),
  ).toBeVisible();
  await expect(page.getByTestId("rsvp-delivery-status")).toHaveCount(0);
});

test("retry preserves request key; success separates phone capture from delivery", async ({
  page,
}) => {
  const payloads: Array<Record<string, unknown>> = [];
  await page.unroute("**/api/public/rsvp");
  await page.route("**/api/public/rsvp", async (route) => {
    const payload = route.request().postDataJSON();
    payloads.push(payload);
    if (payloads.length === 1)
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Fixture retry needed" }),
      });
    const date = payload.eventId.slice(-10);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        created: true,
        rsvpId: "synthetic-receipt",
        confirmationStatus: "not_available",
        confirmationSent: false,
        event: {
          ...runOnDate(date),
          id: payload.eventId,
          version: payload.eventVersion,
          label: "Synthetic review run",
          timeLabel: "7:00 AM",
          status: "scheduled",
          notice: "",
          number: 0,
        },
      }),
    });
  });
  await page.getByLabel("First name", { exact: true }).fill("Local Fixture");
  await page.getByLabel("Email or phone", { exact: true }).fill("4125550100");
  await page.getByTestId("rsvp-submit").click();
  await expect(page.getByText("Fixture retry needed")).toBeVisible();
  await page.getByTestId("rsvp-submit").click();
  await expect(page.getByTestId("rsvp-delivery-status")).toContainText(
    "Automatic text reminders are not enabled",
  );
  expect(payloads[0].idempotencyKey).toBe(payloads[1].idempotencyKey);
  expect(payloads[0].eventId).toMatch(/^gryt-saturday-/);
  await expect(page.getByText("Synthetic review run", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "RSVP someone else" }).click();
  await expect(page.getByLabel("First name", { exact: true })).toHaveValue("");
});

test("calendar navigation and 375px viewport stay usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByTestId("rsvp-submit")).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/calendar", { waitUntil: "domcontentloaded" });
  const heading = await page.locator("h2").textContent();
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.locator("h2")).not.toHaveText(heading);
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(page.locator("h2")).toHaveText(heading);
  await expect(page.getByRole("link", { name: /Download .* calendar/ })).toHaveAttribute(
    "href",
    /^data:text\/calendar/,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("utility panels keep missing data honest and the navigation points to RSVP", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.locator("nav").getByRole("link", { name: "RSVP Saturday" })).toHaveAttribute(
    "href",
    "#join",
  );
  await expect(page.locator("#weather")).toContainText(
    "The forecast point has not been verified yet",
  );
  await expect(page.locator("#weather")).not.toContainText("Dry start");
  await page.getByRole("button", { name: "6.2 miles", exact: true }).click();
  await expect(page.locator("#route")).toContainText("3.1 miles out");
  await page.getByRole("button", { name: "3 miles", exact: true }).click();
  await expect(page.locator("#route")).toContainText("1.5 miles out");
  await expect(
    page.locator("#route").getByRole("link", { name: "Open address directions" }),
  ).toHaveAttribute("href", /destination=212%20Valley%20Brook/);
  await expect(page.locator("#club-stats")).not.toContainText("Miles this week");
  await expect(page.locator("#club-stats")).not.toContainText("Sample data");
  await expect(page.locator("#club-stats")).toContainText("not a Saturday check-in");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("keyboard RSVP validates locally and Enter submits exactly once", async ({ page }) => {
  let requests = 0;
  page.on("request", request => { if (new URL(request.url()).pathname === "/api/public/rsvp") requests++; });
  await page.getByLabel("First name", { exact: true }).fill("Keyboard Fixture");
  await page.getByLabel("Email or phone", { exact: true }).fill("not a contact");
  await page.getByLabel("Email or phone", { exact: true }).press("Enter");
  await expect(page.getByText("Add your name and a valid email or phone to save your RSVP.")).toBeVisible();
  expect(requests).toBe(0);
  await page.getByLabel("Email or phone", { exact: true }).fill("keyboard@example.com");
  await page.getByLabel("Email or phone", { exact: true }).press("Enter");
  await expect(page.getByText("Fixture storage unavailable. Your RSVP was not saved.")).toBeVisible();
  expect(requests).toBe(1);
});
