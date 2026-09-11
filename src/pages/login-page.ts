import type { Page } from '@playwright/test';

import { BaseAppPage } from './base-app-page';

export class LoginPage extends BaseAppPage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  get loginHeading() {
    return this.page.getByRole('heading', {
      name: 'Login to your account',
    });
  }

  get emailInput() {
    return this.page.getByTestId('login-email');
  }

  get passwordInput() {
    return this.page.getByTestId('login-password');
  }

  get loginButton() {
    return this.page.getByRole('button', {
      name: 'Login',
    });
  }

  get loggedInAs() {
    return this.page.getByText('Logged in as');
  }

  /**
   * Waits for the form to be ready and for login to have taken effect -
   * readiness checks, not test assertions. Page objects don't assert;
   * that the login actually succeeded is for the caller (auth.setup.ts)
   * to assert, not this method.
   */
  async login(email: string, password: string): Promise<void> {
    await this.loginHeading.waitFor({ state: 'visible' });

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    await this.loginButton.click();

    await this.loggedInAs.waitFor({ state: 'visible' });
  }
}
