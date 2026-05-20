import { defineConfig, devices } from "@playwright/test";

const WEB_URL = process.env["E2E_WEB_URL"] ?? "http://localhost:3200";
const ADMIN_URL = process.env["E2E_ADMIN_URL"] ?? "http://localhost:3300";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "e2e-artifacts/report", open: "never" }]],
  outputDir: "e2e-artifacts/output",
  use: {
    baseURL: WEB_URL,
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-web",
      use: { ...devices["Desktop Chrome"], baseURL: WEB_URL },
      testMatch: /tests\/(golden-path|smoke\/customer)\/.+\.spec\.ts$/,
    },
    {
      name: "chromium-admin",
      use: { ...devices["Desktop Chrome"], baseURL: ADMIN_URL },
      testMatch: /tests\/smoke\/admin\/.+\.spec\.ts$/,
    },
  ],
});
