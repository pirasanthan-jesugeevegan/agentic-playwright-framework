// spec: docs/test-plans/login-test-plan.md
import { expect, test } from '../../../src/fixtures/pom/test-options';
import { KNOWN_ACCOUNT } from '../../../src/data/known-account';

test.describe('Login', { tag: '@regression' }, () => {
  test('TC-12: Verify that the user sees their logged-in status after signing in with valid credentials', async ({
    loginPage,
  }) => {
    await test.step('GIVEN a visitor is on the login page', async () => {
      await loginPage.open();
    });

    await test.step('WHEN they submit a known, valid email and password', async () => {
      await loginPage.attemptLogin(KNOWN_ACCOUNT.email, KNOWN_ACCOUNT.password);
    });

    await test.step('THEN the header shows they are logged in', async () => {
      await expect(loginPage.loggedInAs).toBeVisible();
    });
  });
});
