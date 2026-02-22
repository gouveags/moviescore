import { expect, test } from "@playwright/test";

test("seeded local user can sign in and sign out", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("test.user@moviescore.local");
  await page.getByLabel("Password").fill("MoviescoreTest#123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: /welcome back, test pilot\./i })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
