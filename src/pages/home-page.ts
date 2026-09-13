import type { Locator, Page } from '@playwright/test';
import { BaseAppPage } from './base-app-page';

export class HomePage extends BaseAppPage {
  readonly categoryPanel: Locator;

  constructor(page: Page) {
    super(page);

    this.categoryPanel = page.locator('.left-sidebar');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  get featuredItemsHeading() {
    return this.page.getByRole('heading', { name: 'Features Items' });
  }

  get categorySidebar() {
    return this.page.getByRole('heading', { name: 'Category' });
  }
}
