import { test, expect } from "@playwright/test";

test.describe("RLS blocks non-admin write attempts", () => {
  test("non-admin cannot access admin dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });

  test("non-admin cannot access hospital creation page", async ({ page }) => {
    await page.goto("/admin/hospitals/new", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });

  test("non-admin cannot access review moderation", async ({ page }) => {
    await page.goto("/admin/reviews", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });

  test("POST to admin hospital API returns 401 without auth", async ({
    request,
  }) => {
    const response = await request.post(
      "http://localhost:3000/api/admin/hospitals",
      {
        data: {
          name: "Fake Hospital",
          address: "123 Fake Street",
          phone: "+2348012345678",
          city: "Lagos",
          lga: "Ikeja",
          latitude: 6.5,
          longitude: 3.3,
          specialties: ["emergency"],
          ownership: "public",
        },
      },
    );
    expect(response.status()).toBe(401);
  });

  test("PATCH to admin hospital API returns 401 without auth", async ({
    request,
  }) => {
    const response = await request.patch(
      "http://localhost:3000/api/admin/hospitals/e17a35fb-0e65-4fc0-8363-1668df5b9473",
      { data: { name: "Hacked Name" } },
    );
    expect(response.status()).toBe(401);
  });

  test("DELETE to admin hospital API returns 401 without auth", async ({
    request,
  }) => {
    const response = await request.delete(
      "http://localhost:3000/api/admin/hospitals/e17a35fb-0e65-4fc0-8363-1668df5b9473",
    );
    expect(response.status()).toBe(401);
  });

  test("review moderation API returns 401 without auth", async ({
    request,
  }) => {
    const response = await request.patch(
      "http://localhost:3000/api/admin/reviews/00000000-0000-0000-0000-000000000001",
      { data: { status: "approved" } },
    );
    expect(response.status()).toBe(401);
  });
});
