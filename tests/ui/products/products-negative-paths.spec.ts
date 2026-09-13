// spec: docs/test-plans/products-test-plan.md
import { expect, test } from '../../../src/fixtures/pom/test-options';

test.describe('Products', { tag: '@regression' }, () => {
  test('TC-11: Verify that the user sees no product cards when searching for a term that matches nothing', async ({
    productsPage,
  }) => {
    await test.step('GIVEN a visitor is on the products page', async () => {
      await productsPage.open();
    });

    await test.step('WHEN they search for a term no product name contains', async () => {
      await productsPage.search('zzzznonexistentproductxyz123');
    });

    await test.step('THEN the Searched Products heading is shown with zero product cards', async () => {
      // No "no results" message exists - the grid is just empty.
      await expect(productsPage.searchedProductsHeading).toBeVisible();
      await expect(productsPage.productCards()).toHaveCount(0);
    });
  });
});
