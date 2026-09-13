import { defineConfig, type ReporterDescription } from '@playwright/test';
import { loadFrameworkConfig } from './src/config/framework';
import { projects } from './src/config/projects';

const config = loadFrameworkConfig();

const allureReporter: ReporterDescription = [
  'allure-playwright',
  {
    resultsDir: 'allure-results',
    environmentInfo: {
      env: process.env.ENV ?? 'dev',
      app_url: config.appUrl,
      node: process.version,
      os: `${process.platform} ${process.arch}`,
      ci: process.env.CI ? 'GitHub Actions' : 'local',
      commit: process.env.GITHUB_SHA?.slice(0, 8) ?? 'working tree',
      branch: process.env.GITHUB_REF_NAME ?? 'local',
    },
  },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: config.retries,
  workers: config.workers,
  reporter: [['list'], ['html'], allureReporter],
  use: {
    baseURL: config.appUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: config.timeout,
    testIdAttribute: 'data-qa',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },
  projects,
});
