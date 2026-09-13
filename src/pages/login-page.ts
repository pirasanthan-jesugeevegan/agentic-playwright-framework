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

  /** Shown only on a failed login attempt; has no id, class, or data-qa. */
  get incorrectCredentialsMessage() {
    return this.page.getByText('Your email or password is incorrect!');
  }

  /** Fills and submits the login form without waiting for the outcome. */
  async attemptLogin(email: string, password: string): Promise<void> {
    await this.loginHeading.waitFor({ state: 'visible' });

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    await this.loginButton.click();
  }

  /** Logs in and waits for the logged-in state to appear. */
  async login(email: string, password: string): Promise<void> {
    await this.attemptLogin(email, password);
    await this.loggedInAs.waitFor({ state: 'visible' });
  }
}
