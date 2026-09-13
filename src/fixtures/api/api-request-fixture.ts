import { test as base } from '@playwright/test';

import { apiRequest as apiRequestClient } from './api-client';
import type {
  ApiRequestFn,
  ApiRequestMethods,
  ApiRequestParams,
} from '../../../types/api';

/**
 * Fixture exposing `apiRequest` for making HTTP calls in API tests.
 *
 * @example
 * ```ts
 * const { status, body } = await apiRequest({
 *   method: 'POST',
 *   url: '/searchProduct',
 *   form: { search_product: 'top' },
 * });
 * ```
 */
export const test = base.extend<ApiRequestMethods>({
  apiRequest: async ({ request }, use) => {
    const apiRequestFn: ApiRequestFn = async <T = unknown>(
      params: ApiRequestParams,
    ) => apiRequestClient<T>({ request, ...params });

    await use(apiRequestFn);
  },
});
