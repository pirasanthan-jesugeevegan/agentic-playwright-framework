import type { Page } from '@playwright/test';
import { BaseAppPage } from './base-app-page';

export class HomePage extends BaseAppPage {
  constructor(page: Page) {
    super(page);
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
