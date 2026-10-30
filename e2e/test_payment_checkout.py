"""Checkout regression checks. Run with python3 e2e/test_payment_checkout.py."""
import asyncio
import unittest
from playwright.async_api import async_playwright


class PaymentCheckoutTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context(viewport={"width": 1280, "height": 1800})
        self.page = await self.context.new_page()

    async def asyncTearDown(self):
        await self.browser.close()
        await self.playwright.stop()

    async def test_pre_hydration_cannot_submit_contact_details(self):
        context = await self.browser.new_context(java_script_enabled=False)
        page = await context.new_page()
        await page.goto("http://localhost:8080/support")
        self.assertTrue(await page.get_by_role("button", name="Loading payment form").is_disabled())
        self.assertTrue(await page.get_by_label("Full name", exact=True).is_disabled())
        self.assertEqual(page.url, "http://localhost:8080/support")
        await context.close()

    async def test_checkout_failure_is_visible_and_retryable(self):
        for path in ("/support", "/shop/checkout"):
            with self.subTest(path=path):
                await self.page.goto("http://localhost:8080" + path, wait_until="networkidle")
                await self.page.get_by_label("Full name", exact=True).fill("GRYT Regression Test")
                await self.page.get_by_label("Email", exact=True).fill("checkout-regression@example.com")
                requests = []

                async def fail_checkout(route):
                    if route.request.method == "POST":
                        requests.append(route.request.url)
                        await asyncio.sleep(1)
                        await route.abort("failed")
                    else:
                        await route.continue_()

                await self.page.route("**/*_serverFn*", fail_checkout)
                button = self.page.get_by_role("button", name="Continue")
                await button.click()
                await self.page.get_by_role("status").filter(has_text="Opening secure").wait_for()
                self.assertTrue(await self.page.get_by_role("button", name="Opening test checkout").is_disabled())
                await self.page.get_by_role("alert").wait_for()
                self.assertTrue((await self.page.get_by_role("alert").inner_text()).strip())
                self.assertEqual(self.page.url, "http://localhost:8080" + path)
                await button.click()
                await self.page.get_by_role("alert").wait_for()
                self.assertEqual(len(requests), 2)
                await self.page.unroute("**/*_serverFn*", fail_checkout)

    async def test_unavailable_events_and_private_packages_stay_closed(self):
        await self.page.goto("http://localhost:8080/events/inactive-sample", wait_until="networkidle")
        self.assertIn("No active event", await self.page.locator("main").inner_text())
        self.assertEqual(await self.page.get_by_role("button", name="Continue").count(), 0)
        await self.page.goto("http://localhost:8080/partners/pay", wait_until="networkidle")
        self.assertIn("valid private package link", await self.page.locator("main").inner_text())
        self.assertEqual(await self.page.get_by_role("button", name="Continue").count(), 0)


if __name__ == "__main__":
    unittest.main()