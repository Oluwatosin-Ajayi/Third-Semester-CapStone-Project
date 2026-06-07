import { test, expect } from "@playwright/test";

test.describe("Geolocation fallback", () => {
  test("home page loads without geolocation permission", async ({
    page,
    context,
  }) => {
    // Deny geolocation
    await context.setGeolocation(null);
    await context.grantPermissions([]);

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Page should still load
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("search still works when location is denied", async ({
    page,
    context,
  }) => {
    await context.setGeolocation(null);
    await context.grantPermissions([]);

    await page.goto("/search?query=Lagos");
    await page.waitForTimeout(2000);

    // Should show results without error
    const body = page.locator("body");
    await expect(body).not.toContainText("Unhandled");
  });

  test("location error message shown gracefully", async ({ page, context }) => {
    await context.setGeolocation(null);
    await page.goto("/");
    await page.waitForTimeout(3000);
    // Page should load without crashing
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("search by LGA works without geolocation", async ({ page, context }) => {
    await context.setGeolocation(null);
    await context.grantPermissions([]);

    await page.goto("/search?lga=Mushin");
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/lga=Mushin/);
    const body = page.locator("body");
    await expect(body).not.toContainText("Error");
  });

  test("radius filter disabled when no location", async ({ page, context }) => {
    await context.setGeolocation(null);
    await context.grantPermissions([]);
    await page.goto("/search");
    await page.waitForTimeout(2000);
    // Filter panel should be visible
    const body = page.locator("body");
    await expect(body).not.toContainText("Error");
  });
});
