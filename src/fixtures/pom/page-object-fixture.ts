import { test as base } from '../framework-fixtures';
import {
  CartPage,
  ContactPage,
  HomePage,
  LoginPage,
  ProductDetailPage,
  ProductsPage,
} from '../../pages';

export interface PageObjectFixtures {
  homePage: HomePage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  contactPage: ContactPage;
  loginPage: LoginPage;
}

/**
 * Page object fixtures. A spec only pays for the ones it destructures,
 * e.g. `async ({ productsPage, cartPage }) => ...`.
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
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from '@playwright/test';
