import { expect, test as setup } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { LoginPage } from '../src/pages/login-page';
import { KNOWN_ACCOUNT } from '../src/data/known-account';

const authFile = path.resolve('.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  await mkdir(path.dirname(authFile), { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(KNOWN_ACCOUNT.email, KNOWN_ACCOUNT.password);
  await expect(loginPage.loggedInAs).toBeVisible();
  await page.context().storageState({ path: authFile });
});
