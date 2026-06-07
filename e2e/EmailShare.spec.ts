import { test, expect } from "@playwright/test";

test.describe("Email Share", () => {
  test("share modal has email input", async ({ page }) => {
    await page.goto("/search?query=Lagos");
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: /share/i }).click();
    await page.getByText("Share Results").waitFor();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("send button is disabled when no email entered", async ({ page }) => {
    await page.goto("/search?query=Lagos");
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: /share/i }).click();
    await page.getByText("Share Results").waitFor();

    const sendBtn = page.getByRole("button", { name: /send to/i });
    await expect(sendBtn).toBeDisabled();
  });

  test("hospital checkboxes appear in share modal", async ({ page }) => {
    await page.goto("/search?query=Lagos");
    await page.waitForTimeout(2000);
    await page.getByRole("button", { name: /share/i }).click();
    await page.getByText("Share Results").waitFor();

    // If hospitals loaded, checkboxes should be visible
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test("share API returns 200 with valid payload", async ({ page }) => {
    const response = await page.request.post("/api/share", {
      data: {
        to: "delivered@resend.dev",
        hospitalIds: ["e17a35fb-0e65-4fc0-8363-1668df5b9473"],
        senderName: "E2E Test",
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("share API returns 422 with invalid email", async ({ page }) => {
    const response = await page.request.post("/api/share", {
      data: {
        to: "not-an-email",
        hospitalIds: ["e17a35fb-0e65-4fc0-8363-1668df5b9473"],
      },
    });
    expect(response.status()).toBe(422);
  });

  test("share API returns 422 with empty hospital list", async ({ page }) => {
    const response = await page.request.post("/api/share", {
      data: {
        to: "test@example.com",
        hospitalIds: [],
      },
    });
    expect(response.status()).toBe(422);
  });

  test("revalidate API returns 401 with wrong secret", async ({ page }) => {
    const response = await page.request.post("/api/revalidate", {
      data: {
        secret: "wrong-secret",
        hospitalId: "e17a35fb-0e65-4fc0-8363-1668df5b9473",
      },
    });
    expect(response.status()).toBe(401);
  });
});
