import { test as setup } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { LoginPage } from '../src/pages/login-page';

const authFile = path.resolve('.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  await mkdir(path.dirname(authFile), { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('demo1@demo1.com', 'Test1234!');
  await page.context().storageState({ path: authFile });
});
