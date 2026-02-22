import { expect, test } from "@playwright/test";

test("home page renders key decision-engine content", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MovieScore" })).toBeVisible();
  await expect(page.getByText("SSR-ready Next.js app is running.")).toBeVisible();
});
