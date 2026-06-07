# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> Search Hospitals >> clicking a hospital card navigates to detail page
- Location: e2e\search.spec.ts:49:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Search Hospitals", () => {
  4  |   test("navigates to home page successfully", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await expect(page).toHaveTitle(/carefinder/i);
  7  |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  8  |   });
  9  | 
  10 |   test("search bar is present on home page", async ({ page }) => {
  11 |     await page.goto("/");
  12 |     const input = page.locator('input[placeholder*="Search"]').first();
  13 |     await expect(input).toBeVisible();
  14 |   });
  15 | 
  16 |   test("searching Lagos shows results", async ({ page }) => {
  17 |     await page.goto("/search?query=Lagos");
  18 |     // Wait for results to load
  19 |     await page.waitForTimeout(2000);
  20 |     // Should show results or empty state — not crash
  21 |     const body = page.locator("body");
  22 |     await expect(body).not.toContainText("Error");
  23 |   });
  24 | 
  25 |   test("search page loads with query param", async ({ page }) => {
  26 |     await page.goto("/search?query=Abuja");
  27 |     await expect(page).toHaveURL(/query=Abuja/);
  28 |     await page.waitForTimeout(1500);
  29 |     // National Hospital Abuja should appear
  30 |     const content = page.locator("body");
  31 |     await expect(content).toContainText("Abuja");
  32 |   });
  33 | 
  34 |   test("specialty filter appears on search page", async ({ page }) => {
  35 |     await page.goto("/search");
  36 |     await page.waitForTimeout(1000);
  37 |     await expect(page.getByText("Filters")).toBeVisible();
  38 |   });
  39 | 
  40 |   test("show map button toggles map visibility", async ({ page }) => {
  41 |     await page.goto("/search?query=Lagos");
  42 |     await page.waitForTimeout(1500);
  43 |     const mapButton = page.getByRole("button", { name: /show map/i });
  44 |     await expect(mapButton).toBeVisible();
  45 |     await mapButton.click();
  46 |     await expect(page.getByRole("button", { name: /hide map/i })).toBeVisible();
  47 |   });
  48 | 
  49 |   test("clicking a hospital card navigates to detail page", async ({
  50 |     page,
  51 |   }) => {
  52 |     await page.goto("/search?query=Abuja");
  53 |     await page.waitForTimeout(2000);
  54 | 
  55 |     const firstCard = page.locator("a[href^='/hospitals/']").first();
  56 |     const exists = await firstCard.count();
  57 | 
  58 |     if (exists > 0) {
  59 |       await firstCard.click();
> 60 |       await page.waitForURL(/\/hospitals\//, { timeout: 15000 });
     |                  ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  61 |     }
  62 |   });
  63 | });
  64 | 
```