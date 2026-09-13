import type { Locator, Page } from '@playwright/test';
import { BaseAppPage } from './base-app-page';

export class ProductsPage extends BaseAppPage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly allProductsHeading: Locator;
  readonly searchedProductsHeading: Locator;
  readonly productGrid: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');

    this.allProductsHeading = page.getByRole('heading', {
      name: 'All Products',
    });
    this.searchedProductsHeading = page.getByRole('heading', {
      name: 'Searched Products',
    });
    this.productGrid = page.locator('.features_items');
  }

  async open(): Promise<void> {
    await this.goto('/products');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** Cards shown after a search, or on the unfiltered listing. */
  productCards(): Locator {
    return this.page.locator('.product-image-wrapper');
  }
}
