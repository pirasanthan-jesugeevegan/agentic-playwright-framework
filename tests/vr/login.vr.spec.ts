// spec: docs/vr-test-plans/login-vr-test-plan.md
import { expect, test } from '../../src/fixtures/pom/test-options';
import { KNOWN_ACCOUNT } from '../../src/data/known-account';

test.describe('Visual regression - login', { tag: '@regression' }, () => {
  test('VR-10: Verify that the user sees the incorrect-credentials error rendered correctly', async ({
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
      await loginPage.incorrectCredentialsMessage.waitFor({
        state: 'visible',
      });
    });

    await test.step('THEN the login form, including the error, matches its baseline', async () => {
      await expect(loginPage.loginForm).toHaveScreenshot(
        'login-incorrect-credentials.png',
      );
    });
  });
});
