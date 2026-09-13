import type { Locator, Page } from '@playwright/test';
import { BaseAppPage } from './base-app-page';

export class ProductDetailPage extends BaseAppPage {
  readonly productInfoPanel: Locator;
  readonly productName: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly cartModal: Locator;
  readonly cartModalContent: Locator;
  readonly viewCartLink: Locator;

  constructor(page: Page) {
    super(page);

    this.productInfoPanel = page.locator('.product-information');
    this.productName = this.productInfoPanel.getByRole('heading', {
      level: 2,
    });
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = this.productInfoPanel.locator('.cart');
    this.cartModal = page.locator('#cartModal');
    this.cartModalContent = this.cartModal.locator('.modal-content');
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
