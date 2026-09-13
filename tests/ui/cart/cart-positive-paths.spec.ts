// spec: docs/test-plans/cart-test-plan.md
import { expect, test } from '../../../src/fixtures/pom/test-options';
import { KNOWN_PRODUCT } from '../../../src/data/catalog';

test.describe('Cart', { tag: '@regression' }, () => {
  test('TC-08: Verify that the user sees the cart return to its empty state after removing the only item', async ({
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
      await expect(cartPage.emptyCartMessage).toBeVisible();
    });
  });
});
