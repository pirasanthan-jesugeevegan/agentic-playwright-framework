import { type Locator, type Page } from '@playwright/test';
import { BaseAppPage } from './base-app-page';
export class CartPage extends BaseAppPage {
  readonly emptyCartMessage: Locator;
  readonly cartTable: Locator;
  constructor(page: Page) {
    super(page);
    this.emptyCartMessage = page.locator('#empty_cart');
    this.cartTable = page.locator('#cart_info_table');
  }
  async open(): Promise<void> {
    await this.goto('/view_cart');
  }
  row(productId: number): Locator {
    return this.page.locator(`#product-${productId}`).first();
  }
  async quantityFor(productId: number): Promise<string> {
    return (
      (
        await this.row(productId).locator('.cart_quantity button').textContent()
      )?.trim() ?? ''
    );
  }
  async removeFromCart(productId: number): Promise<void> {
    await this.row(productId).locator('.cart_quantity_delete').click();
  }
  async isEmpty(): Promise<boolean> {
    return this.emptyCartMessage.isVisible();
  }
}
