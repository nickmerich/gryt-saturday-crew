import { test, expect } from "@playwright/test";

/**
 * End-to-end coverage for the 2026 waiver flow.
 *
 * Verifies that an adult signer can complete the form and that the
 * "Waiver completed" badge renders with the correct signed date and
 * 2026 coverage confirmation after submission.
 */
test.describe("Waiver flow", () => {
  test("adult can sign and sees Waiver completed badge with signed date", async ({
    page,
  }) => {
    const unique = Date.now();
    const NAME = "Waiver E2E Tester";
    const EMAIL = `waiver-e2e-${unique}@example.com`;

    await page.goto("/waiver", { waitUntil: "networkidle" });

    // The form is gated on a real email + DOB + signature match.
    await page.getByLabel("Full legal name").fill(NAME);
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Date of birth").fill("1990-05-15");
    await page.getByLabel("Emergency contact").fill("Jane Doe");
    await page.getByLabel("Their phone").fill("5555555555");

    // All three agreement checkboxes must be ticked for the submit
    // button to enable.
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    // Typed signature must equal full legal name (case-insensitive).
    await page.getByLabel("Type your full name to sign").fill(NAME);

    const submit = page.getByRole("button", { name: /sign.*waiver|sign$/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    // Success state should appear with the dated coverage confirmation.
    await expect(
      page.getByText(/Waiver signed.*covered through Dec 31, 2026/i),
    ).toBeVisible({ timeout: 15_000 });

    // Signed date should be today (server returns ISO date in UTC).
    const today = new Date().toISOString().slice(0, 10);
    await expect(page.getByText(today)).toBeVisible();

    // Verify the persistent "Waiver completed" badge renders on the
    // homepage after signing (state is cached in localStorage).
    await page.goto("/", { waitUntil: "networkidle" });
    const badge = page
      .getByText(/Waiver completed.*covered through Dec 31, 2026/i)
      .first();
    await expect(badge).toBeVisible();
    await expect(page.getByText(today).first()).toBeVisible();
  });

  test("minor (under 18) is blocked from signing online", async ({ page }) => {
    await page.goto("/waiver", { waitUntil: "networkidle" });

    const NAME = "Too Young";
    await page.getByLabel("Full legal name").fill(NAME);
    await page.getByLabel("Email").fill(`minor-${Date.now()}@example.com`);
    // 10 years old
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 10);
    await page.getByLabel("Date of birth").fill(dob.toISOString().slice(0, 10));
    await page.getByLabel("Emergency contact").fill("Parent Name");
    await page.getByLabel("Their phone").fill("5555555555");

    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }
    await page.getByLabel("Type your full name to sign").fill(NAME);

    // Submit should be blocked client-side for minors.
    const submit = page.getByRole("button", { name: /sign.*waiver|sign$/i });
    await expect(submit).toBeDisabled();
    await expect(page.getByText(/at least 18|minor/i).first()).toBeVisible();
  });
});
