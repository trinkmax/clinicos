import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests e2e. Levanta el dev server con env dummy de Supabase: getClaims
 * falla → sin sesión → el proxy redirige a /login (exactamente lo que se valida).
 * Browser: `pnpm exec playwright install chromium` (una vez).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_dummy",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
  },
});
