import { expect, test } from '../../../src/fixtures/pom/test-options';

/** Checks that each top-level page still loads and shows its defining landmark. */
test.describe('Smoke', { tag: '@smoke' }, () => {
  test('TC-01: Verify that the user sees the header nav and featured items rail when the home page loads', async ({
    homePage,
  }) => {
    await test.step('GIVEN a visitor opens the home page', async () => {
      await homePage.open();
    });

    await test.step('THEN the header nav and the features rail are visible', async () => {
      await expect(homePage.homeLink).toBeVisible();
      await expect(homePage.productsLink).toBeVisible();
      await expect(homePage.cartLink).toBeVisible();
      await expect(homePage.featuredItemsHeading).toBeVisible();
    });
  });

  test('TC-02: Verify that the user sees the All Products heading and at least one product card when the products page loads', async ({
    productsPage,
  }) => {
    await test.step('GIVEN a visitor opens the products page', async () => {
      await productsPage.open();
    });

    await test.step('THEN the All Products heading and at least one card are visible', async () => {
      await expect(productsPage.allProductsHeading).toBeVisible();
      await expect(productsPage.productCards().first()).toBeVisible();
    });
  });

  test('TC-03: Verify that the user sees every field of the message form when the contact us page loads', async ({
    contactPage,
  }) => {
    await test.step('GIVEN a visitor opens the contact us page', async () => {
      await contactPage.open();
    });

    await test.step('THEN every field of the message form is visible', async () => {
      await expect(contactPage.nameInput).toBeVisible();
      await expect(contactPage.emailInput).toBeVisible();
      await expect(contactPage.subjectInput).toBeVisible();
      await expect(contactPage.messageInput).toBeVisible();
      await expect(contactPage.submitButton).toBeVisible();
    });
  });
});
