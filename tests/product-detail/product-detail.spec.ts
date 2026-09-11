import { expect, test } from '../../src/fixtures/base-test';
import { KNOWN_PRODUCT } from '../../src/data/catalog';

test.describe('Product detail', { tag: '@regression' }, () => {
  test('adding to cart opens the confirmation modal with a link to the cart', async ({
    productDetailPage,
  }) => {
    await test.step(`GIVEN a visitor is viewing product #${KNOWN_PRODUCT.id}`, async () => {
      await productDetailPage.open(KNOWN_PRODUCT.id);
      await expect(productDetailPage.productName).toHaveText(
        KNOWN_PRODUCT.name,
      );
    });

    await test.step('WHEN they add it to the cart', async () => {
      await productDetailPage.addToCart();
    });

    await test.step('THEN the confirmation modal offers a way to the cart', async () => {
      await expect(productDetailPage.cartModal).toBeVisible();
      await expect(productDetailPage.viewCartLink).toBeVisible();
    });
  });

  test('the chosen quantity carries through to the cart', async ({
    productDetailPage,
    cartPage,
  }) => {
    const quantity = 3;

    await test.step(`GIVEN a visitor sets quantity to ${quantity} on product #${KNOWN_PRODUCT.id}`, async () => {
      await productDetailPage.open(KNOWN_PRODUCT.id);
      await productDetailPage.setQuantity(quantity);
    });

    await test.step('WHEN they add it to the cart and follow the link there', async () => {
      await productDetailPage.addToCart();
      await productDetailPage.goToCartFromModal();
    });

    await test.step(`THEN the cart shows quantity ${quantity} for that product`, async () => {
      await expect(cartPage.row(KNOWN_PRODUCT.id)).toBeVisible();
      expect(await cartPage.quantityFor(KNOWN_PRODUCT.id)).toBe(
        String(quantity),
      );
    });
  });
});
