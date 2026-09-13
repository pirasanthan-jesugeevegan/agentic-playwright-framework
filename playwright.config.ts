import { defineConfig, type ReporterDescription } from '@playwright/test';
import { loadFrameworkConfig } from './src/config/framework';
import { projects } from './src/config/projects';

const config = loadFrameworkConfig();

/**
 * Fills the published report's Environment panel, so a run says what it
 * actually executed against instead of leaving a reader to guess which
 * commit, branch, or tier produced it.
 */
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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: config.timeout,
    testIdAttribute: 'data-qa',
  },
  projects,
});
