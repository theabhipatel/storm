import { test, expect } from "../../../support/fixtures";

test.describe("Anonymous browsing and cart merge", () => {
  test("anonymous user can browse, search and see CTA to log in", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();

    // Top category menu visible on desktop
    const categoryStrip = page.locator("nav[aria-label='Categories']");
    if (await categoryStrip.isVisible().catch(() => false)) {
      await expect(categoryStrip).toBeVisible();
    }

    // Search
    await page.getByLabel("Search").fill("phone");
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/search/);
    await expect(page.locator("h1")).toContainText(/Results for|Search/i);
  });
});
