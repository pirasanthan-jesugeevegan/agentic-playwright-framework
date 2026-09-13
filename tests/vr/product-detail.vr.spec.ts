// spec: docs/vr-test-plans/product-detail-vr-test-plan.md
import { expect, test } from '../../src/fixtures/pom/test-options';
import { KNOWN_PRODUCT } from '../../src/data/catalog';

test.describe(
  'Visual regression - product detail',
  { tag: '@regression' },
  () => {
    test('VR-04: Verify that the user sees the product information panel rendered correctly', async ({
      productDetailPage,
    }) => {
      await test.step(`GIVEN a visitor opens product #${KNOWN_PRODUCT.id}`, async () => {
        await productDetailPage.open(KNOWN_PRODUCT.id);
      });

      await test.step('THEN the product information panel matches its baseline', async () => {
        await expect(productDetailPage.productInfoPanel).toBeVisible();
        await expect(productDetailPage.productInfoPanel).toHaveScreenshot(
          'product-detail-info-default.png',
        );
      });
    });

    test('VR-05: Verify that the user sees the add-to-cart confirmation modal rendered correctly', async ({
      productDetailPage,
    }) => {
      await test.step(`GIVEN a visitor is on product #${KNOWN_PRODUCT.id}`, async () => {
        await productDetailPage.open(KNOWN_PRODUCT.id);
      });

      await test.step('WHEN they add it to the cart', async () => {
        await productDetailPage.addToCart();
      });

      await test.step('THEN the confirmation dialog matches its baseline', async () => {
        await expect(productDetailPage.cartModalContent).toBeVisible();
        await expect(productDetailPage.cartModalContent).toHaveScreenshot(
          'product-detail-cart-modal.png',
        );
      });
    });
  },
);
