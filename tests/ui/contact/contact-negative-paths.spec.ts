// spec: docs/test-plans/contact-test-plan.md
import { expect, test } from '../../../src/fixtures/pom/test-options';

test.describe('Contact us', { tag: '@regression' }, () => {
  test('TC-11: Verify that the user cannot submit the contact form with its required fields empty', async ({
    contactPage,
  }) => {
    await test.step('GIVEN a visitor is on the contact us page', async () => {
      await contactPage.open();
    });

    await test.step('WHEN they submit the form without filling any field', async () => {
      await contactPage.submitButton.click();
    });

    await test.step('THEN the browser blocks the submission and no success banner appears', async () => {
      // Only the email field carries the `required` attribute, so the
      // browser's own validation blocks the submit on that field before
      // this page's JS ever runs - no native confirm() dialog appears in
      // this path.
      await expect(contactPage.emailInput).toHaveJSProperty(
        'validity.valid',
        false,
      );
      await expect(contactPage.successBanner).toBeHidden();
    });
  });
});
