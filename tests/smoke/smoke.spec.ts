import { expect, test } from '../../src/fixtures/base-test';

/**
 * The fast, broad check: does each top-level page still load and show
 * its defining landmark. Nothing here depends on catalog data, so this
 * suite should never fail because the demo store's products changed.
 */
test.describe('Smoke', { tag: '@smoke' }, () => {
  test('the home page loads with the header nav', async ({ homePage }) => {
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

  test('the products page loads with the catalog heading', async ({
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

  test('the contact us page loads with the message form', async ({
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
