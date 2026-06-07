import { test, expect } from "@playwright/test";

test.describe("Share Link", () => {
  test("Share button is visible on search page", async ({ page }) => {
    await page.goto("/search");
    await page.waitForTimeout(1000);
    await expect(page.getByRole("button", { name: /share/i })).toBeVisible();
  });

  test("clicking Share opens share modal", async ({ page }) => {
    await page.goto("/search?query=Lagos");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: /share/i }).click();
    await expect(page.getByText("Share Results")).toBeVisible();
  });

  test("share modal contains a shareable link", async ({ page }) => {
    await page.goto("/search?query=Lagos&city=Lagos");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: /share/i }).click();
    await page.getByText("Share Results").waitFor();

    // The URL input should contain /search
    const urlInput = page.locator("input[readonly]");
    const value = await urlInput.inputValue();
    expect(value).toContain("/search");
  });

  test("copy button copies link to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/search?query=Lagos");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: /share/i }).click();
    await page.getByText("Share Results").waitFor();

    await page.getByRole("button", { name: /copy/i }).click();
    await expect(page.getByRole("button", { name: /copied/i })).toBeVisible();
  });

  test("share URL encodes filter parameters correctly", async ({ page }) => {
    await page.goto(
      "/search?query=Lagos&specialties=maternity&ownership=public",
    );
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: /share/i }).click();
    await page.getByText("Share Results").waitFor();

    const urlInput = page.locator("input[readonly]");
    const value = await urlInput.inputValue();
    expect(value).toContain("query=Lagos");
  });

  test("opening shared URL reproduces same search", async ({ page }) => {
    const sharedUrl = "/search?query=Abuja&ownership=public";
    await page.goto(sharedUrl);
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/query=Abuja/);
    await expect(page).toHaveURL(/ownership=public/);
  });

  test("closing share modal works", async ({ page }) => {
    await page.goto("/search");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: /share/i }).click();
    await page.getByText("Share Results").waitFor();
    await page.locator("button").filter({ hasText: "×" }).click();
    await expect(page.getByText("Share Results")).not.toBeVisible();
  });
});
