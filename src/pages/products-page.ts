import type { Locator, Page } from '@playwright/test';
import { BaseAppPage } from './base-app-page';

export class ProductsPage extends BaseAppPage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly allProductsHeading: Locator;
  readonly searchedProductsHeading: Locator;

  constructor(page: Page) {
    super(page);

    // No accessible name or data-qa hook on the search box; #search_product
    // and #submit_search are the application's own ids, not test-only ones.
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');

    this.allProductsHeading = page.getByRole('heading', {
      name: 'All Products',
    });
    this.searchedProductsHeading = page.getByRole('heading', {
      name: 'Searched Products',
    });
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

  /**
   * Every product on this listing renders two "Add to cart" links (one for
   * the static card, one for the hover overlay) plus a "View Product" link
   * addressed by /product_details/{id}. Rather than disambiguate two
   * hover-dependent duplicates here, add-to-cart is exercised from the
   * product detail page, where the control is singular. This page object
   * only needs to get there.
   */
  viewProductLink(productId: number): Locator {
    return this.page.locator(`a[href="/product_details/${productId}"]`);
  }

  async viewProduct(productId: number): Promise<void> {
    await this.viewProductLink(productId).click();
  }
}
