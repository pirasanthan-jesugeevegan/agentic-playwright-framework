import { expect, test } from '../../src/fixtures/base-test';
import { KNOWN_PRODUCT } from '../../src/data/catalog';

test.describe('Cart', { tag: '@regression' }, () => {
  test('a fresh session starts with an empty cart', async ({ cartPage }) => {
    await test.step('GIVEN a visitor with no prior activity opens the cart', async () => {
      await cartPage.open();
    });

    await test.step('THEN the empty-cart message is shown', async () => {
      expect(await cartPage.isEmpty()).toBe(true);
    });
  });

  test('removing the only item returns the cart to its empty state', async ({
    productDetailPage,
    cartPage,
  }) => {
    await test.step(`GIVEN product #${KNOWN_PRODUCT.id} was added to the cart`, async () => {
      await productDetailPage.open(KNOWN_PRODUCT.id);
      await productDetailPage.addToCart();
      await productDetailPage.goToCartFromModal();
      await expect(cartPage.row(KNOWN_PRODUCT.id)).toBeVisible();
    });

    await test.step('WHEN it is removed', async () => {
      await cartPage.removeFromCart(KNOWN_PRODUCT.id);
    });

    await test.step('THEN the cart reports empty again', async () => {
      await cartPage.expectEmpty();
    });
  });
});
