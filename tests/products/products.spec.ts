import { expect, test } from '../../src/fixtures/base-test';
import { KNOWN_PRODUCT, SEARCH_TERM } from '../../src/data/catalog';

test.describe('Products', { tag: '@regression' }, () => {
  test('searching returns a Searched Products heading and results', async ({
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
      // Deliberately not asserting an exact count: the demo catalog's
      // contents drift over time, and a fixed number here would fail on
      // that drift rather than on anything this suite actually owns.
      await expect(productsPage.productCards().first()).toBeVisible();
    });
  });

  test('the View Product link opens the matching product detail page', async ({
    productsPage,
    productDetailPage,
  }) => {
    await test.step('GIVEN a visitor is on the products page', async () => {
      await productsPage.open();
    });

    await test.step(`WHEN they open product #${KNOWN_PRODUCT.id}`, async () => {
      await productsPage.viewProduct(KNOWN_PRODUCT.id);
    });

    await test.step("THEN the detail page shows that product's name", async () => {
      await expect(productDetailPage.productName).toHaveText(
        KNOWN_PRODUCT.name,
      );
    });
  });
});
