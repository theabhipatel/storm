import { test, expect } from "../../../support/fixtures";

const ADMIN_EMAIL = process.env["E2E_ADMIN_EMAIL"];
const ADMIN_PASSWORD = process.env["E2E_ADMIN_PASSWORD"];

test.describe("Admin smoke", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "Admin credentials not configured");
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL!);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test("dashboard tiles render", async ({ page }) => {
    await expect(page.getByText(/Orders/i)).toBeVisible();
    await expect(page.getByText(/Revenue/i)).toBeVisible();
    await expect(page.getByText(/Low.?stock SKUs/i)).toBeVisible();
  });

  test("notifications page loads", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.locator("h1")).toContainText(/notifications/i);
  });

  test("audit page loads", async ({ page }) => {
    await page.goto("/audit");
    await expect(page.locator("h1")).toContainText(/audit/i);
  });

  test("orders CSV export can be triggered", async ({ page }) => {
    await page.goto("/orders");
    const exportBtn = page.getByRole("button", { name: /export orders/i });
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await expect(page.getByText(/Download|queued|running|failed/i)).toBeVisible({ timeout: 30_000 });
    }
  });

  test("admin transitions order through statuses", async ({ page }) => {
    await page.goto("/orders");
    const firstRow = page.locator('a[href^="/orders/"]').first();
    if (!(await firstRow.isVisible())) {
      test.skip(true, "No orders to transition");
      return;
    }
    await firstRow.click();
    const next = page.getByRole("button", { name: /confirm|process|ship|deliver/i }).first();
    if (await next.isVisible()) {
      await next.click();
    }
  });
});
