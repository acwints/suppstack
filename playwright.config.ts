import { defineConfig } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());
const port = Number(process.env.COMMERCE_EVAL_PORT || 3511);

export default defineConfig({
  testDir: './evals',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', {
    outputFile: process.env.COMMERCE_EVAL_REPORT || 'test-results/commerce-report.json',
  }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${port} --hostname 127.0.0.1`,
    url: `http://127.0.0.1:${port}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
