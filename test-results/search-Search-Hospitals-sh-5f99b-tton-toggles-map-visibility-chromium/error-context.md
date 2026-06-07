# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> Search Hospitals >> show map button toggles map visibility
- Location: e2e\search.spec.ts:40:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /show map/i })
    - locator resolved to <button class="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors border-gray-200 text-gray-600 hover:border-green-400">Show Map</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - link "CF Carefinder" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e8]: CF
          - generic [ref=e9]: Carefinder
        - generic [ref=e10]:
          - link "Find Hospitals" [ref=e11] [cursor=pointer]:
            - /url: /search
          - link "Admin" [ref=e12] [cursor=pointer]:
            - /url: /admin/login
    - generic [ref=e14]:
      - search "Search hospitals" [ref=e16]:
        - searchbox "Search hospitals" [ref=e17]: Lagos
        - button "Search" [ref=e18] [cursor=pointer]
      - button "Export CSV" [disabled] [ref=e19]
      - button "Share" [ref=e20] [cursor=pointer]
      - button "Hide Map" [active] [ref=e21] [cursor=pointer]
    - generic [ref=e23]:
      - complementary [ref=e24]:
        - complementary [ref=e25]:
          - heading "Filters" [level=2] [ref=e27]
          - generic [ref=e28]:
            - heading "Ownership" [level=3] [ref=e29]
            - generic [ref=e30]:
              - button "public" [ref=e31] [cursor=pointer]
              - button "private" [ref=e32] [cursor=pointer]
          - generic [ref=e33]:
            - heading "Distance" [level=3] [ref=e34]
            - paragraph [ref=e35]: Enable location to filter by distance
          - generic [ref=e36]:
            - heading "Specialties" [level=3] [ref=e37]
            - generic [ref=e38]:
              - button "emergency" [ref=e39] [cursor=pointer]
              - button "maternity" [ref=e40] [cursor=pointer]
              - button "pediatric" [ref=e41] [cursor=pointer]
              - button "dental" [ref=e42] [cursor=pointer]
              - button "surgery" [ref=e43] [cursor=pointer]
              - button "cardiology" [ref=e44] [cursor=pointer]
              - button "neurology" [ref=e45] [cursor=pointer]
              - button "oncology" [ref=e46] [cursor=pointer]
              - button "ophthalmology" [ref=e47] [cursor=pointer]
              - button "orthopedics" [ref=e48] [cursor=pointer]
              - button "psychiatry" [ref=e49] [cursor=pointer]
              - button "radiology" [ref=e50] [cursor=pointer]
              - button "physiotherapy" [ref=e51] [cursor=pointer]
              - button "dermatology" [ref=e52] [cursor=pointer]
              - button "urology" [ref=e53] [cursor=pointer]
      - generic [ref=e54]:
        - paragraph [ref=e57]: Loading map...
        - paragraph [ref=e59]: 0 hospitals found
        - generic [ref=e60]:
          - paragraph [ref=e61]: 🏥
          - paragraph [ref=e62]: No hospitals found
          - paragraph [ref=e63]: Try adjusting your search or filters
  - button "Open Next.js Dev Tools" [ref=e69] [cursor=pointer]:
    - img [ref=e70]
  - alert [ref=e73]
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
> 45 |     await mapButton.click();
     |                     ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
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
  60 |       await page.waitForURL(/\/hospitals\//, { timeout: 15000 });
  61 |     }
  62 |   });
  63 | });
  64 | 
```