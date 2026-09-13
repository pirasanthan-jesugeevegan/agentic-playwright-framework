import { devices, type Project } from '@playwright/test';
import { loadFrameworkConfig } from './framework';

const config = loadFrameworkConfig();

export const projects: Project[] = [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },

  // tests/ui, tests/api, and tests/vr are sibling trees, so every browser
  // project below pins testDir to tests/ui to avoid also picking up API and
  // visual-regression specs.

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
    // Only matches *.authenticated.spec.ts - the account cart is shared
    // server-side, so running every spec here too would double up
    // cart/product-detail tests against it.
    testDir: './tests/ui',
    testMatch: /.*\.authenticated\.spec\.ts$/,
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: '.auth/user.json',
    },
  },

  {
    name: 'api',
    // No browser device - API specs use Playwright's `request` fixture only.
    testDir: './tests/api',
    use: {
      baseURL: config.apiUrl,
    },
  },

  // TODO: a `visual-regression` project (testDir: './tests/vr') per CLAUDE.md's roadmap.
];
