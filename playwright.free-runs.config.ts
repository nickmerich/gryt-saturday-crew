import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname)) {
  throw new Error('These tests run only against an isolated local app. Use the read-only deployment script for remote sites.');
}

export default defineConfig({
  testDir: './e2e',
  testMatch: 'free-runs.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : undefined,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
});
