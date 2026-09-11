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
    // Scoped to its own naming convention rather than matching every spec.
    // automationexercise.com's cart is tied to the account server-side for a
    // logged-in session - unlike the anonymous, per-browser-context cart the
    // rest of the suite exercises - so letting this project pick up every
    // spec ran each cart/product-detail test a second time against that same
    // persisted account cart, in parallel with itself across workers,
    // accumulating quantities between runs (a "3" coming back "5"). No spec
    // needs a logged-in session yet; name one *.authenticated.spec.ts here
    // once one does.
    testMatch: /.*\.authenticated\.spec\.ts$/,
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: '.auth/user.json',
    },
  },
];
