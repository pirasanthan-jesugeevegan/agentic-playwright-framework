// spec: docs/test-plans/login-test-plan.md
import { expect, test } from '../../../src/fixtures/pom/test-options';
import { KNOWN_ACCOUNT } from '../../../src/data/known-account';

test.describe('Login', { tag: '@regression' }, () => {
  test('TC-13: Verify that the user sees an error message after signing in with an incorrect password', async ({
    loginPage,
  }) => {
    await test.step('GIVEN a visitor is on the login page', async () => {
      await loginPage.open();
    });

    await test.step('WHEN they submit a known email with the wrong password', async () => {
      await loginPage.attemptLogin(
        KNOWN_ACCOUNT.email,
        'not-the-real-password',
      );
    });

    await test.step('THEN an incorrect-credentials message is shown and no session starts', async () => {
      await expect(loginPage.incorrectCredentialsMessage).toBeVisible();
      await expect(loginPage.loggedInAs).toBeHidden();
    });
  });
});
