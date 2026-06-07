# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Login and Hospital Management >> admin can navigate to add hospital form
- Location: e2e\admin.spec.ts:52:7

# Error details

```
TimeoutError: page.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')
    - locator resolved to <input value="" required="" type="email" placeholder="admin@carefinder.ng" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"/>
    - fill("samueljay280@gmail.com")
  - attempting fill action
    - waiting for element to be visible, enabled and editable

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e6]: CF
      - generic [ref=e7]: Carefinder
      - generic [ref=e8]: Admin
    - heading "Sign in" [level=1] [ref=e9]
    - paragraph [ref=e10]: Admin access only. Contact your administrator if you need access.
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Email address
        - textbox "admin@carefinder.ng" [active] [ref=e14]: samueljay280@gmail.com
      - generic [ref=e15]:
        - generic [ref=e16]: Password
        - textbox "••••••••" [ref=e17]
      - button "Sign in" [ref=e18] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e24] [cursor=pointer]:
    - img [ref=e25]
  - alert [ref=e28]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | // Replace with your real admin credentials
  4  | const ADMIN_EMAIL = "samueljay280@gmail.com";
  5  | const ADMIN_PASSWORD = "T#?M@hSFZeW7&ue";
  6  | 
  7  | test.describe("Admin Login and Hospital Management", () => {
  8  |   test("admin route redirects to login when unauthenticated", async ({
  9  |     page,
  10 |   }) => {
  11 |     await page.goto("/admin/dashboard");
  12 |     await expect(page).toHaveURL(/\/admin\/login/);
  13 |   });
  14 | 
  15 |   test("admin login page loads correctly", async ({ page }) => {
  16 |     await page.goto("/admin/login");
  17 |     await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  18 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  19 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  20 |   });
  21 | 
  22 |   test("wrong credentials shows error", async ({ page }) => {
  23 |     await page.goto("/admin/login");
  24 |     await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  25 |     await page.fill('input[type="email"]', "wrong@email.com");
  26 |     await page.fill('input[type="password"]', "wrongpassword");
  27 |     await page.click('button[type="submit"]');
  28 |     await page.waitForTimeout(2000);
  29 |     await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  30 |   });
  31 | 
  32 |   test("admin can log in successfully", async ({ page }) => {
  33 |     await page.goto("/admin/login");
  34 |     await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  35 |     await page.fill('input[type="email"]', ADMIN_EMAIL);
  36 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  37 |     await page.click('button[type="submit"]');
  38 |     await page.waitForURL("/admin/dashboard", { timeout: 30000 });
  39 |     await expect(page.getByText("Dashboard")).toBeVisible();
  40 |   });
  41 | 
  42 |   test("dashboard shows hospital list after login", async ({ page }) => {
  43 |     await page.goto("/admin/login");
  44 |     await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  45 |     await page.fill('input[type="email"]', ADMIN_EMAIL);
  46 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  47 |     await page.click('button[type="submit"]');
  48 |     await page.waitForURL("/admin/dashboard", { timeout: 30000 });
  49 |     await expect(page.getByText("Recent Hospitals")).toBeVisible();
  50 |   });
  51 | 
  52 |   test("admin can navigate to add hospital form", async ({ page }) => {
  53 |     await page.goto("/admin/login");
  54 |     await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
> 55 |     await page.fill('input[type="email"]', ADMIN_EMAIL);
     |                ^ TimeoutError: page.fill: Timeout 15000ms exceeded.
  56 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  57 |     await page.click('button[type="submit"]');
  58 |     await page.waitForURL("/admin/dashboard", { timeout: 30000 });
  59 |     await page
  60 |       .getByRole("link", { name: /add hospital/i })
  61 |       .first()
  62 |       .click();
  63 |     await page.waitForURL("/admin/hospitals/new", { timeout: 15000 });
  64 |     await expect(page.getByText("Add Hospital")).toBeVisible();
  65 |   });
  66 | 
  67 |   test("admin hospital form has required fields", async ({ page }) => {
  68 |     await page.goto("/admin/login");
  69 |     await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  70 |     await page.fill('input[type="email"]', ADMIN_EMAIL);
  71 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  72 |     await page.click('button[type="submit"]');
  73 |     await page.waitForURL("/admin/dashboard", { timeout: 30000 });
  74 |     await page.goto("/admin/hospitals/new");
  75 |     await expect(page.getByPlaceholder(/hospital name/i)).toBeVisible();
  76 |     await expect(page.getByPlaceholder(/address/i)).toBeVisible();
  77 |     await expect(page.getByPlaceholder(/\+234/)).toBeVisible();
  78 |   });
  79 | 
  80 |   test("admin form shows Zod validation errors on empty submit", async ({
  81 |     page,
  82 |   }) => {
  83 |     await page.goto("/admin/login");
  84 |     await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  85 |     await page.fill('input[type="email"]', ADMIN_EMAIL);
  86 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  87 |     await page.click('button[type="submit"]');
  88 |     await page.waitForURL("/admin/dashboard", { timeout: 30000 });
  89 |     await page.goto("/admin/hospitals/new");
  90 |     await page.getByRole("button", { name: /create hospital/i }).click();
  91 |     await page.waitForTimeout(500);
  92 |     // Zod errors should appear
  93 |     const body = page.locator("body");
  94 |     await expect(body).toContainText("characters");
  95 |   });
  96 | });
  97 | 
```