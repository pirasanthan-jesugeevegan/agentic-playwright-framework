import { defineConfig } from '@playwright/test';
import { loadFrameworkConfig } from './src/config/framework';
import { projects } from './src/config/projects';

const config = loadFrameworkConfig();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: config.retries,
  workers: config.workers,
  reporter: [
    ['list'],
    ['html'],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  use: {
    baseURL: config.appUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: config.timeout,
    testIdAttribute: 'data-qa',
  },
  projects,
});
