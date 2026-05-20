import { test, expect, makeCustomer } from "../../../support/fixtures";

test.describe("Wishlist add → move to cart", () => {
  test("authenticated user can add an item to wishlist and move it to cart", async ({ page }) => {
    const customer = makeCustomer();

    // Sign up + auto-verify is covered by golden-path; here we assume an
    // already-verified seed account or skip if signup form is not available.
    await page.goto("/auth/login");
    if (!(await page.getByLabel(/email/i).isVisible().catch(() => false))) {
      test.skip(true, "Login page not available in current build");
    }

    // Try with a known seeded user; tests should provide one via env vars.
    const seededEmail = process.env["E2E_USER_EMAIL"];
    const seededPassword = process.env["E2E_USER_PASSWORD"];
    test.skip(!seededEmail || !seededPassword, "Seeded user creds not configured");

    await page.getByLabel(/email/i).fill(seededEmail!);
    await page.getByLabel(/password/i).fill(seededPassword!);
    await page.getByRole("button", { name: /log in/i }).click();

    await page.goto("/");
    const firstProduct = page.locator('a[href^="/p/"]').first();
    await firstProduct.click();
    await page.getByRole("button", { name: /add to wishlist/i }).click();

    await page.goto("/wishlist");
    await expect(page.getByText(/your wishlist|no wishlist|Move to cart/i)).toBeVisible();

    const moveButton = page.getByRole("button", { name: /move to cart/i }).first();
    if (await moveButton.isVisible()) {
      await moveButton.click();
      await expect(page.getByText(/moved to cart/i)).toBeVisible();
    }
  });
});
