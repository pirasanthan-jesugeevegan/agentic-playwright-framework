import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import type { Browser, BrowserContext } from '@playwright/test';

const AUTH_DIR = path.resolve('.auth');

export const AUTH_STATE_PATH = path.join(AUTH_DIR, 'user.json');

export async function createAuthenticatedContext(
  browser: Browser,
): Promise<BrowserContext> {
  await mkdir(AUTH_DIR, { recursive: true });

  return browser.newContext({
    storageState: AUTH_STATE_PATH,
  });
}
