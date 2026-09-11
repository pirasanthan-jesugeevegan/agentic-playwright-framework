import { test as setup } from '@playwright/test';

import { mkdir } from 'node:fs/promises';

import path from 'node:path';

const authFile = path.resolve('.auth', 'user.json');

setup('authenticate', async () => {
  await mkdir(path.dirname(authFile), {
    recursive: true,
  });

  /*
   * Authentication will be implemented once the
   * target application's login contract is known.
   *
   * For now, this setup intentionally fails fast
   * rather than pretending authentication succeeded.
   */

  throw new Error(
    'Authentication setup is not configured yet. ' +
      'Implement the application-specific login flow before ' +
      'using authenticated projects.',
  );
});
