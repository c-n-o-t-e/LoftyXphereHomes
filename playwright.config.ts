import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    timeout: 60_000,
    reporter: [["list"]],
    use: {
        baseURL,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
        ? undefined
        : {
              command: "npm run start",
              url: baseURL,
              reuseExistingServer:
                  !process.env.CI && !process.env.PLAYWRIGHT_FORCE_WEBSERVER,
              timeout: 120_000,
              env: {
                  ...process.env,
                  PORT: port,
                  E2E_MOCK_PAYSTACK: "true",
                  E2E_MOCK_FLUTTERWAVE: "true",
                  PAYSTACK_SECRET_KEY:
                      process.env.PAYSTACK_SECRET_KEY ?? "sk_test_e2e",
                  FLUTTERWAVE_SECRET_KEY:
                      process.env.FLUTTERWAVE_SECRET_KEY ?? "flw_test_e2e",
                  FLUTTERWAVE_SECRET_HASH:
                      process.env.FLUTTERWAVE_SECRET_HASH ?? "e2e_flw_hash",
                  NEXT_PUBLIC_SITE_URL: baseURL,
              },
          },
});
