# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: EmailShare.spec.ts >> Email Share >> share API returns 200 with valid payload
- Location: e2e\EmailShare.spec.ts:37:7

# Error details

```
TimeoutError: apiRequestContext.post: Timeout 15000ms exceeded.
Call log:
  - → POST http://localhost:3000/api/share
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 108

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Email Share", () => {
  4  |   test("share modal has email input", async ({ page }) => {
  5  |     await page.goto("/search?query=Lagos");
  6  |     await page.waitForTimeout(1500);
  7  |     await page.getByRole("button", { name: /share/i }).click();
  8  |     await page.getByText("Share Results").waitFor();
  9  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  10 |   });
  11 | 
  12 |   test("send button is disabled when no email entered", async ({ page }) => {
  13 |     await page.goto("/search?query=Lagos");
  14 |     await page.waitForTimeout(1500);
  15 |     await page.getByRole("button", { name: /share/i }).click();
  16 |     await page.getByText("Share Results").waitFor();
  17 | 
  18 |     const sendBtn = page.getByRole("button", { name: /send to/i });
  19 |     await expect(sendBtn).toBeDisabled();
  20 |   });
  21 | 
  22 |   test("hospital checkboxes appear in share modal", async ({ page }) => {
  23 |     await page.goto("/search?query=Lagos");
  24 |     await page.waitForTimeout(2000);
  25 |     await page.getByRole("button", { name: /share/i }).click();
  26 |     await page.getByText("Share Results").waitFor();
  27 | 
  28 |     // If hospitals loaded, checkboxes should be visible
  29 |     const checkboxes = page.locator('input[type="checkbox"]');
  30 |     const count = await checkboxes.count();
  31 | 
  32 |     if (count > 0) {
  33 |       expect(count).toBeGreaterThan(0);
  34 |     }
  35 |   });
  36 | 
  37 |   test("share API returns 200 with valid payload", async ({ page }) => {
> 38 |     const response = await page.request.post("/api/share", {
     |                                         ^ TimeoutError: apiRequestContext.post: Timeout 15000ms exceeded.
  39 |       data: {
  40 |         to: "delivered@resend.dev",
  41 |         hospitalIds: ["e17a35fb-0e65-4fc0-8363-1668df5b9473"],
  42 |         senderName: "E2E Test",
  43 |       },
  44 |     });
  45 |     expect(response.status()).toBe(200);
  46 |     const body = await response.json();
  47 |     expect(body.success).toBe(true);
  48 |   });
  49 | 
  50 |   test("share API returns 422 with invalid email", async ({ page }) => {
  51 |     const response = await page.request.post("/api/share", {
  52 |       data: {
  53 |         to: "not-an-email",
  54 |         hospitalIds: ["e17a35fb-0e65-4fc0-8363-1668df5b9473"],
  55 |       },
  56 |     });
  57 |     expect(response.status()).toBe(422);
  58 |   });
  59 | 
  60 |   test("share API returns 422 with empty hospital list", async ({ page }) => {
  61 |     const response = await page.request.post("/api/share", {
  62 |       data: {
  63 |         to: "test@example.com",
  64 |         hospitalIds: [],
  65 |       },
  66 |     });
  67 |     expect(response.status()).toBe(422);
  68 |   });
  69 | 
  70 |   test("revalidate API returns 401 with wrong secret", async ({ page }) => {
  71 |     const response = await page.request.post("/api/revalidate", {
  72 |       data: {
  73 |         secret: "wrong-secret",
  74 |         hospitalId: "e17a35fb-0e65-4fc0-8363-1668df5b9473",
  75 |       },
  76 |     });
  77 |     expect(response.status()).toBe(401);
  78 |   });
  79 | });
  80 | 
```