import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for GRYT end-to-end tests.
 *
 * Run with:  bunx playwright test
 * Single spec: bunx playwright test e2e/waiver.spec.ts
 *
 * Assumes the dev server is already running on PLAYWRIGHT_BASE_URL
 * (defaults to http://localhost:8080, which is what `bun run dev` uses).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 1800 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
