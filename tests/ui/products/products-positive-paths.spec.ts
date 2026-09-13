// spec: docs/test-plans/products-test-plan.md
import { expect, test } from '../../../src/fixtures/pom/test-options';
import { SEARCH_TERM } from '../../../src/data/catalog';

test.describe('Products', { tag: '@regression' }, () => {
  test('TC-04: Verify that the user sees a Searched Products heading and results after searching', async ({
    productsPage,
  }) => {
    await test.step('GIVEN a visitor is on the products page', async () => {
      await productsPage.open();
    });

    await test.step(`WHEN they search for "${SEARCH_TERM}"`, async () => {
      await productsPage.search(SEARCH_TERM);
    });

    await test.step('THEN the page switches to a Searched Products result set', async () => {
      await expect(productsPage.searchedProductsHeading).toBeVisible();
      // Not asserting an exact count - the demo catalog's contents drift over time.
      await expect(productsPage.productCards().first()).toBeVisible();
    });
  });
});
