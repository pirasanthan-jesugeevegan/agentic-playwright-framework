import { mergeTests } from '@playwright/test';

import { test as pageObjectTest } from './page-object-fixture';
import { test as apiRequestTest } from '../api/api-request-fixture';

/**
 * Combined test with page object and API request fixtures.
 * Import this in your spec files instead of `@playwright/test`.
 *
 * @example
 * ```ts
 * import { test, expect } from '../../src/fixtures/pom/test-options';
 *
 * test('example', async ({ productsPage, apiRequest }) => {
 *   await productsPage.open();
 *   await apiRequest({ method: 'GET', url: '/productsList' });
 * });
 * ```
 */
export const test = mergeTests(pageObjectTest, apiRequestTest);
export { expect, request } from '@playwright/test';
