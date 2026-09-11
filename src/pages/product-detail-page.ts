import type { Locator, Page } from '@playwright/test';
import { BaseAppPage } from './base-app-page';

export class ProductDetailPage extends BaseAppPage {
  readonly productName: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly cartModal: Locator;
  readonly viewCartLink: Locator;

  constructor(page: Page) {
    super(page);

    this.productName = page
      .locator('.product-information')
      .getByRole('heading', { level: 2 });
    // Application ids, verified unique on this page: one #quantity input,
    // one .cart button.
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('.product-information .cart');
    this.cartModal = page.locator('#cartModal');
    this.viewCartLink = this.cartModal.getByRole('link', { name: 'View Cart' });
  }

  async open(productId: number): Promise<void> {
    await this.goto(`/product_details/${productId}`);
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await this.cartModal.waitFor({ state: 'visible' });
  }

  async goToCartFromModal(): Promise<void> {
    await this.viewCartLink.click();
  }
}
