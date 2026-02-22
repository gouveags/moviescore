import { expect, test } from "@playwright/test";

test("landing page renders key decision-engine content", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MovieScore" })).toBeVisible();
  await expect(page.getByText("A decision engine for what to watch next.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  await expect(page.getByText("Watch less junk. Pick better tonight.")).toBeVisible();
});
