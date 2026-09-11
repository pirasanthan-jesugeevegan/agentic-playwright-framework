import type { Locator, Page } from '@playwright/test';

/**
 * Shared chrome every page on the site carries: the header nav.
 * Feature pages extend this rather than re-locating the same five
 * links in every page object.
 */
export class BaseAppPage {
  readonly page: Page;

  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly contactUsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // The Bootstrap "nav" class is reused on ~30 other elements on this
    // page (carousels, tabs), so it only identifies the header links once
    // it's scoped inside the single <header> element.
    const nav = page.locator('header .nav');
    this.homeLink = nav.getByRole('link', { name: 'Home' });
    this.productsLink = nav.getByRole('link', { name: 'Products' });
    this.cartLink = nav.getByRole('link', { name: 'Cart' });
    this.signupLoginLink = nav.getByRole('link', { name: 'Signup / Login' });
    this.contactUsLink = nav.getByRole('link', { name: 'Contact us' });
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async goToProducts(): Promise<void> {
    await this.productsLink.click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async goToContactUs(): Promise<void> {
    await this.contactUsLink.click();
  }
}
