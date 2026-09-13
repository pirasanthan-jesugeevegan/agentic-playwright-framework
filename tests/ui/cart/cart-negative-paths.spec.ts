// spec: docs/test-plans/cart-test-plan.md
import { expect, test } from '../../../src/fixtures/pom/test-options';
import { KNOWN_PRODUCT } from '../../../src/data/catalog';

test.describe('Cart', { tag: '@regression' }, () => {
  test('TC-09: Verify that the user sees a login prompt and remains on the cart when attempting to check out without an account', async ({
    productDetailPage,
    cartPage,
    page,
  }) => {
    await test.step(`GIVEN product #${KNOWN_PRODUCT.id} is in the cart`, async () => {
      await productDetailPage.open(KNOWN_PRODUCT.id);
      await productDetailPage.addToCart();
      await productDetailPage.goToCartFromModal();
    });

    await test.step('WHEN an anonymous visitor proceeds to checkout', async () => {
      await cartPage.proceedToCheckoutAsGuest();
    });

    await test.step('THEN a login prompt is shown and the visitor stays on the cart', async () => {
      await expect(cartPage.registerLoginLink).toBeVisible();
      await expect(page).toHaveURL(/\/view_cart$/);
    });
  });
});
