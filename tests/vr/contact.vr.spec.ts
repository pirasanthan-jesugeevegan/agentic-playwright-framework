// spec: docs/vr-test-plans/contact-vr-test-plan.md
import { expect, test } from '../../src/fixtures/pom/test-options';

test.describe('Visual regression - contact', { tag: '@regression' }, () => {
  test('VR-09: Verify that the user sees the contact form rendered correctly', async ({
    contactPage,
  }) => {
    await test.step('GIVEN a visitor is on the contact us page', async () => {
      await contactPage.open();
    });

    await test.step('THEN the form matches its baseline', async () => {
      await expect(contactPage.submitButton).toBeVisible();
      await expect(contactPage.contactForm).toHaveScreenshot(
        'contact-form-default.png',
      );
    });
  });
});
