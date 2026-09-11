import { devices, type Project } from '@playwright/test';

export const projects: Project[] = [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },

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

  {
    name: 'mobile-chrome',
    use: {
      ...devices['Pixel 5'],
    },
  },

  {
    name: 'mobile-safari',
    use: {
      ...devices['iPhone 13'],
    },
  },

  {
    name: 'chromium-authenticated',
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: '.auth/user.json',
    },
  },
];
