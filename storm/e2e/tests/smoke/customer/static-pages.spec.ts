import { test, expect } from "../../../support/fixtures";

const PAGES = [
  { path: "/about", heading: /About Storm/i },
  { path: "/contact", heading: /Contact us/i },
  { path: "/privacy-policy", heading: /Privacy Policy/i },
  { path: "/terms", heading: /Terms of Service/i },
  { path: "/shipping-policy", heading: /Shipping Policy/i },
  { path: "/returns-policy", heading: /Returns Policy/i },
  { path: "/faq", heading: /Frequently asked questions/i },
];

test.describe("Static pages", () => {
  for (const p of PAGES) {
    test(`${p.path} renders`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator("h1")).toContainText(p.heading);
    });
  }

  test("404 page is branded", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/couldn.?t find that page/i)).toBeVisible();
  });
});
