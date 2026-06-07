import { test, expect } from "@playwright/test";

// Replace with your real admin credentials
const ADMIN_EMAIL = "samueljay280@gmail.com";
const ADMIN_PASSWORD = "T#?M@hSFZeW7&ue";

test.describe("Admin Login and Hospital Management", () => {
  test("admin route redirects to login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin login page loads correctly", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("wrong credentials shows error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', "wrong@email.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("admin can log in successfully", async ({ page }) => {
    await page.goto("/admin/login");
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin/dashboard", { timeout: 30000 });
    await expect(page.getByText("Dashboard")).toBeVisible();
  });

  test("dashboard shows hospital list after login", async ({ page }) => {
    await page.goto("/admin/login");
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin/dashboard", { timeout: 30000 });
    await expect(page.getByText("Recent Hospitals")).toBeVisible();
  });

  test("admin can navigate to add hospital form", async ({ page }) => {
    await page.goto("/admin/login");
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin/dashboard", { timeout: 30000 });
    await page
      .getByRole("link", { name: /add hospital/i })
      .first()
      .click();
    await page.waitForURL("/admin/hospitals/new", { timeout: 15000 });
    await expect(page.getByText("Add Hospital")).toBeVisible();
  });

  test("admin hospital form has required fields", async ({ page }) => {
    await page.goto("/admin/login");
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin/dashboard", { timeout: 30000 });
    await page.goto("/admin/hospitals/new");
    await expect(page.getByPlaceholder(/hospital name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/address/i)).toBeVisible();
    await expect(page.getByPlaceholder(/\+234/)).toBeVisible();
  });

  test("admin form shows Zod validation errors on empty submit", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin/dashboard", { timeout: 30000 });
    await page.goto("/admin/hospitals/new");
    await page.getByRole("button", { name: /create hospital/i }).click();
    await page.waitForTimeout(500);
    // Zod errors should appear
    const body = page.locator("body");
    await expect(body).toContainText("characters");
  });
});
