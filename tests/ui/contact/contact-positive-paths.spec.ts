import { expect, test } from '../../../src/fixtures/pom/test-options';
import { generateContactMessage } from '../../../src/data/contact-message';

test.describe('Contact us', { tag: '@regression' }, () => {
  test('TC-10: Verify that the user sees a success banner after submitting the contact form', async ({
    contactPage,
  }) => {
    const message = generateContactMessage();

    await test.step('GIVEN a visitor fills in the contact form', async () => {
      await contactPage.open();
      await contactPage.fillForm(message);
    });

    await test.step('WHEN they submit it, accepting the confirm prompt', async () => {
      await contactPage.submit();
    });

    await test.step('THEN a success banner confirms the message was sent', async () => {
      await expect(contactPage.successBanner).toBeVisible();
    });
  });
});
