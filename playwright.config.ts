import { defineConfig, devices } from '@playwright/test';
import { loadEnvironment } from './src/config/environment';

const env = loadEnvironment();

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: env.PW_RETRIES ?? (process.env.CI ? 2 : 0),

  workers: env.PW_WORKERS,

  reporter: [['html'], ['list']],

  use: {
    baseURL: env.APP_URL,

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    actionTimeout: env.PW_TIMEOUT,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
});
