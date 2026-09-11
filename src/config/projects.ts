import { devices, type Project } from '@playwright/test';

export const projects: Project[] = [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },

  // The suite root (`testDir: './tests'`, set globally in playwright.config.ts)
  // now holds three sibling trees - tests/ui, tests/api, tests/vr - so every
  // browser project below pins testDir to tests/ui explicitly. Without it,
  // Playwright's default testMatch would also pick up tests/api/**/*.spec.ts
  // and tests/vr/**/*.spec.ts here, running API and visual-regression specs
  // across all five browser/device combinations instead of the dedicated
  // project each of those suites needs once they exist.

  {
    name: 'chromium',
    testDir: './tests/ui',
    use: {
      ...devices['Desktop Chrome'],
    },
  },

  {
    name: 'firefox',
    testDir: './tests/ui',
    use: {
      ...devices['Desktop Firefox'],
    },
  },

  {
    name: 'webkit',
    testDir: './tests/ui',
    use: {
      ...devices['Desktop Safari'],
    },
  },

  {
    name: 'mobile-chrome',
    testDir: './tests/ui',
    use: {
      ...devices['Pixel 5'],
    },
  },

  {
    name: 'mobile-safari',
    testDir: './tests/ui',
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
    testDir: './tests/ui',
    testMatch: /.*\.authenticated\.spec\.ts$/,
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: '.auth/user.json',
    },
  },
];
