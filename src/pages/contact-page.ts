import type { Locator, Page } from '@playwright/test';
import { BaseAppPage } from './base-app-page';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactPage extends BaseAppPage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly successBanner: Locator;

  constructor(page: Page) {
    super(page);

    // This form carries real data-qa hooks - the semantic option here,
    // not a fallback.
    this.nameInput = page.getByTestId('name');
    this.emailInput = page.getByTestId('email');
    this.subjectInput = page.getByTestId('subject');
    this.messageInput = page.getByTestId('message');
    this.submitButton = page.getByTestId('submit-button');
    this.successBanner = page.locator('.status.alert-success');
  }

  async open(): Promise<void> {
    await this.goto('/contact_us');
  }

  async fill(details: ContactMessage): Promise<void> {
    await this.nameInput.fill(details.name);
    await this.emailInput.fill(details.email);
    await this.subjectInput.fill(details.subject);
    await this.messageInput.fill(details.message);
  }

  /**
   * The submit handler on this page opens a native `window.confirm`
   * before it posts the form - a real quirk of the target, not a test
   * artefact. Playwright's dialog handler has to be armed before the
   * click, or the confirm blocks the page indefinitely.
   */
  async submit(): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.submitButton.click();
    await this.successBanner.waitFor({ state: 'visible' });
  }
}
