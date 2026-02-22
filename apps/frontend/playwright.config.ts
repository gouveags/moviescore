import { defineConfig } from "@playwright/test";

const artifactDir = process.env.PLAYWRIGHT_ARTIFACT_DIR ?? "playwright-artifacts";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  reporter: [["list"], ["html", { outputFolder: `${artifactDir}/html`, open: "never" }]],
  outputDir: `${artifactDir}/test-results`,
});
