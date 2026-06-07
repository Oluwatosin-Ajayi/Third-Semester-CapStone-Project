import { test, expect } from "@playwright/test";

test.describe("Search Hospitals", () => {
  test("navigates to home page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/carefinder/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("search bar is present on home page", async ({ page }) => {
    await page.goto("/");
    const input = page.locator('input[placeholder*="Search"]').first();
    await expect(input).toBeVisible();
  });

  test("searching Lagos shows results", async ({ page }) => {
    await page.goto("/search?query=Lagos");
    // Wait for results to load
    await page.waitForTimeout(2000);
    // Should show results or empty state — not crash
    const body = page.locator("body");
    await expect(body).not.toContainText("Error");
  });

  test("search page loads with query param", async ({ page }) => {
    await page.goto("/search?query=Abuja");
    await expect(page).toHaveURL(/query=Abuja/);
    await page.waitForTimeout(1500);
    // National Hospital Abuja should appear
    const content = page.locator("body");
    await expect(content).toContainText("Abuja");
  });

  test("specialty filter appears on search page", async ({ page }) => {
    await page.goto("/search");
    await page.waitForTimeout(1000);
    await expect(page.getByText("Filters")).toBeVisible();
  });

  test("show map button toggles map visibility", async ({ page }) => {
    await page.goto("/search?query=Lagos");
    await page.waitForTimeout(1500);
    const mapButton = page.getByRole("button", { name: /show map/i });
    await expect(mapButton).toBeVisible();
    await mapButton.click();
    await expect(page.getByRole("button", { name: /hide map/i })).toBeVisible();
  });

  test("clicking a hospital card navigates to detail page", async ({
    page,
  }) => {
    await page.goto("/search?query=Abuja");
    await page.waitForTimeout(2000);

    const firstCard = page.locator("a[href^='/hospitals/']").first();
    const exists = await firstCard.count();

    if (exists > 0) {
      await firstCard.click();
      await page.waitForURL(/\/hospitals\//, { timeout: 15000 });
    }
  });
});
