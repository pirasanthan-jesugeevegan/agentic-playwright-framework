import { expect, test } from '../../src/fixtures/pom/test-options';
import { KNOWN_PRODUCT } from '../../src/data/catalog';

test.describe('Visual regression - cart', { tag: '@regression' }, () => {
  test('VR-06: Verify that the user sees the empty cart state rendered correctly', async ({
    cartPage,
  }) => {
    await test.step('GIVEN a visitor with nothing in the cart', async () => {
      await cartPage.open();
    });

    await test.step('THEN the empty-cart message matches its baseline', async () => {
      await expect(cartPage.emptyCartMessage).toBeVisible();
      await expect(cartPage.emptyCartMessage).toHaveScreenshot(
        'cart-empty.png',
      );
    });
  });

  test('VR-07: Verify that the user sees a populated cart rendered correctly', async ({
    productDetailPage,
    cartPage,
  }) => {
    await test.step(`GIVEN product #${KNOWN_PRODUCT.id} is added to the cart`, async () => {
      await productDetailPage.open(KNOWN_PRODUCT.id);
      await productDetailPage.addToCart();
      await productDetailPage.goToCartFromModal();
    });

    await test.step('THEN the cart table matches its baseline', async () => {
      await expect(cartPage.row(KNOWN_PRODUCT.id)).toBeVisible();
      await expect(cartPage.cartTable).toHaveScreenshot(
        'cart-with-single-item.png',
        {
          // VR: product imagery is served with varying compression.
          maxDiffPixelRatio: 0.06,
        },
      );
    });
  });

  test('VR-08: Verify that the user sees the anonymous-checkout guard dialog rendered correctly', async ({
    productDetailPage,
    cartPage,
  }) => {
    await test.step(`GIVEN product #${KNOWN_PRODUCT.id} is in the cart`, async () => {
      await productDetailPage.open(KNOWN_PRODUCT.id);
      await productDetailPage.addToCart();
      await productDetailPage.goToCartFromModal();
    });

    await test.step('WHEN an anonymous visitor proceeds to checkout', async () => {
      await cartPage.proceedToCheckoutAsGuest();
    });

    await test.step('THEN the guard dialog matches its baseline', async () => {
      await expect(cartPage.checkoutModalContent).toBeVisible();
      await expect(cartPage.checkoutModalContent).toHaveScreenshot(
        'cart-checkout-guard.png',
      );
    });
  });
});
