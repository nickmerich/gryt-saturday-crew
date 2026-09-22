import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  await context.route('**/*', route => {
    const request = route.request();
    // No third-party analytics, providers, live datasets, forms, or server writes.
    if (new URL(request.url()).origin !== origin || !['GET', 'HEAD'].includes(request.method())) {
      return route.abort();
    }
    return route.continue();
  });
});

test('old paid registration lands at free RSVP without a purchase form', async ({ page, request }) => {
  const response = await request.get('/register?eventId=gryt_saturday_long_run', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('/#join');
  await page.goto('/register');
  await expect(page).toHaveURL(/\/#join$/);
  await expect(page.locator('#join')).toBeVisible();
  await expect(page.getByRole('button', { name: 'REGISTER & PAY', exact: true })).toHaveCount(0);
  await expect(page.getByText('$25 / entry', { exact: true })).toHaveCount(0);
});

test('all three resource hubs render correct metadata', async ({ page }) => {
  for (const path of ['/resources/playbooks', '/resources/conversations', '/resources/graphics']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://grytrunclub.com${path}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://grytrunclub.com${path}`);
  }
});

test('guide CTA reaches the free RSVP form', async ({ page }) => {
  await page.goto('/resources/playbooks/gryt-vs-yinz-run-club');
  await page.getByRole('link', { name: 'RSVP for Saturday', exact: false }).first().click();
  await expect(page).toHaveURL(/\/#join$/);
  await expect(page.locator('#join')).toBeInViewport();
  await expect(page.locator('#join input').first()).toBeVisible();
});
