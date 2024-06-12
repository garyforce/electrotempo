import { test, expect } from "@playwright/test";

test.describe("Basic Application Functionality", () => {
  test("has title", async ({ page }) => {
    await page.goto("/");
    await page.waitForNavigation();
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/ElectroTempo Dashboard/);
  });
});
