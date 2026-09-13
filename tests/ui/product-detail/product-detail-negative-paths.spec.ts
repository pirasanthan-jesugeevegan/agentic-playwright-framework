// spec: docs/test-plans/product-detail-test-plan.md
import { expect, test } from '../../../src/fixtures/pom/test-options';
import { KNOWN_PRODUCT } from '../../../src/data/catalog';

test.describe('Product detail', { tag: '@regression' }, () => {
  test('TC-07: Verify that the user can add a product at a zero quantity, and the cart reflects it at that quantity', async ({
    productDetailPage,
    cartPage,
  }) => {
    await test.step(`GIVEN a visitor sets quantity to 0 on product #${KNOWN_PRODUCT.id}`, async () => {
      await productDetailPage.open(KNOWN_PRODUCT.id);
      await productDetailPage.setQuantity(0);
    });

    await test.step('WHEN they add it to the cart and follow the link there', async () => {
      // No client-side validation rejects a zero quantity - a finding
      // against the application, not a defect in this test. See
      // docs/STATUS.md.
      await productDetailPage.addToCart();
      await productDetailPage.goToCartFromModal();
    });

    await test.step('THEN the cart lists the product at quantity 0', async () => {
      await expect(cartPage.row(KNOWN_PRODUCT.id)).toBeVisible();
      expect(await cartPage.quantityFor(KNOWN_PRODUCT.id)).toBe('0');
    });
  });
});
