import { test as base } from './framework-fixtures';
import {
  CartPage,
  ContactPage,
  HomePage,
  ProductDetailPage,
  ProductsPage,
} from '../pages';

export interface PageObjectFixtures {
  homePage: HomePage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  contactPage: ContactPage;
}

/**
 * Dependency-injected page objects: a spec names the surfaces it touches
 * in its signature, e.g. `async ({ productsPage, cartPage }) => ...`, and
 * only those are constructed. Extends the framework's own `test` so the
 * authenticated-context fixture stays available alongside these.
 */
export const test = base.extend<PageObjectFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
});

export { expect } from '@playwright/test';
