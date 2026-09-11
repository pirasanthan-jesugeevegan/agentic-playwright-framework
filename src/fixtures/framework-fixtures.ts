import { test as base, expect, type Page } from '@playwright/test';

import { AUTH_STATE_PATH } from '../auth/auth-state';

export interface FrameworkFixtures {
  authenticatedPage: Page;
}

export const test = base.extend<FrameworkFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_STATE_PATH,
    });

    const page = await context.newPage();

    await use(page);

    await context.close();
  },
});

export { expect };
