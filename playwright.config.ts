import { defineConfig } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: './evals',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3511',
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 3511 --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3511/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
