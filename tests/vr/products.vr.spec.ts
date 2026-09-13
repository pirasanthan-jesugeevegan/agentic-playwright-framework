// spec: docs/vr-test-plans/products-vr-test-plan.md
import { expect, test } from '../../src/fixtures/pom/test-options';

test.describe('Visual regression - products', { tag: '@regression' }, () => {
  test('VR-02: Verify that the user sees a product card rendered correctly on the products page', async ({
    productsPage,
  }) => {
    await test.step('GIVEN a visitor is on the unfiltered products page', async () => {
      await productsPage.open();
    });

    await test.step('THEN the first product card matches its baseline', async () => {
      const card = productsPage.productCards().first();
      await expect(card).toBeVisible();
      await expect(card).toHaveScreenshot('products-card-default.png');
    });
  });

  test('VR-03: Verify that the user sees the empty grid state rendered correctly after a no-results search', async ({
    productsPage,
  }) => {
    await test.step('GIVEN a visitor is on the products page', async () => {
      await productsPage.open();
    });

    await test.step('WHEN they search for a term no product name contains', async () => {
      // Same term as TC-05 - the same real, verified empty state, captured
      // visually here instead of asserted on functionally.
      await productsPage.search('zzzznonexistentproductxyz123');
    });

    await test.step('THEN the empty grid matches its baseline', async () => {
      await expect(productsPage.searchedProductsHeading).toBeVisible();
      await expect(productsPage.productGrid).toHaveScreenshot(
        'products-grid-empty.png',
      );
    });
  });
});
