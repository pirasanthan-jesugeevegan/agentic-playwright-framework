import { test as base, expect, type Page } from '@playwright/test';

import { AUTH_STATE_PATH } from '../auth/auth-state';

export interface FrameworkFixtures {
  authenticatedPage: Page;
}

/** Blocks ad iframes that intercept clicks and slow page loads. */
const AD_HOSTS =
  /(doubleclick\.net|googlesyndication\.com|googleadservices\.com)/;

async function blockAds(page: Page): Promise<void> {
  await page.route('**/*', (route) => {
    if (AD_HOSTS.test(route.request().url())) {
      return route.abort();
    }
    return route.continue();
  });
}

export const test = base.extend<FrameworkFixtures>({
  page: async ({ page }, use) => {
    await blockAds(page);
    await use(page);
  },

  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_STATE_PATH,
    });

    const page = await context.newPage();
    await blockAds(page);

    await use(page);

    await context.close();
  },
});

export { expect };
