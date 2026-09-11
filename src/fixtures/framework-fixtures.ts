import { test as base, expect, type Page } from '@playwright/test';

import { AUTH_STATE_PATH } from '../auth/auth-state';

export interface FrameworkFixtures {
  authenticatedPage: Page;
}

/**
 * The target ships real Google AdSense ads. Their iframes and anchor
 * overlays render on top of real controls (add-to-cart, form submit) and
 * intercept clicks, and their payload adds load time and layout reflow on
 * top of the page under test - neither is something under test here, so
 * both are eliminated at the network layer rather than papered over with
 * longer timeouts or `force: true` clicks.
 */
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
