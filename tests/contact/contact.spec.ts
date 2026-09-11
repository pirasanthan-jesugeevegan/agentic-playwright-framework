import { expect, test } from '../../src/fixtures/base-test';
import { generateContactMessage } from '../../src/data/contact-message';

test.describe('Contact us', { tag: '@regression' }, () => {
  test('submitting the form shows the success banner', async ({
    contactPage,
  }) => {
    const message = generateContactMessage();

    await test.step('GIVEN a visitor fills in the contact form', async () => {
      await contactPage.open();
      await contactPage.fill(message);
    });

    await test.step('WHEN they submit it, accepting the confirm prompt', async () => {
      await contactPage.submit();
    });

    await test.step('THEN a success banner confirms the message was sent', async () => {
      await expect(contactPage.successBanner).toBeVisible();
    });
  });
});
