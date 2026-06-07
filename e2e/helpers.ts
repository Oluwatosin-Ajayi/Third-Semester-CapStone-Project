import { Page } from "@playwright/test";

export const TEST_ADMIN_EMAIL = "samueljay280@gmail.com";
export const TEST_ADMIN_PASSWORD = "T#?M@hSFZeW7&ue";

export const TEST_USER_EMAIL = "oluwatosinajayisamuel@gmail.com";
export const TEST_USER_PASSWORD = "T#?M@hSFZeW7&ue";

export const KNOWN_HOSPITAL_ID = "e17a35fb-0e65-4fc0-8363-1668df5b9473";
export const KNOWN_HOSPITAL_NAME = "National Hospital Abuja";

//Log in as admin via the UI
export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.fill('input[type="email"]', TEST_ADMIN_EMAIL);
  await page.fill('input[type="password"]', TEST_ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("/admin/dashboard");
}

//Log in as a regular user via Supabase client directly

export async function loginAsUser(page: Page) {
  await page.goto("/");
  await page.evaluate(
    async ({ email, password, url, key }) => {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key);
      await supabase.auth.signInWithPassword({ email, password });
    },
    {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  );
}
