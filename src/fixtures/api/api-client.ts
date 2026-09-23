import type { APIRequestContext, APIResponse } from '@playwright/test';

import type { ApiRequestParams, ApiRequestResponse } from '../../../types/api';

/** Sends one HTTP request and returns its status and parsed JSON body. */
export async function apiRequest<T = unknown>({
  request,
  method,
  url,
  form,
  params,
  headers,
}: ApiRequestParams & { request: APIRequestContext }): Promise<
  ApiRequestResponse<T>
> {
  // Playwright resolves `url` against baseURL with `new URL()`, so a leading
  // slash discards the baseURL's path ('/api') and the request lands on the
  // website root instead of the API. Callers write '/searchProduct'; make it
  // relative so it resolves under the (trailing-slashed) baseURL.
  const path = url.replace(/^\/+/, '');

  const options: {
    form?: Record<string, string | number | boolean>;
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
  } = {};
  if (form) options.form = form;
  if (params) options.params = params;
  if (headers) options.headers = headers;

  let response: APIResponse;
  switch (method) {
    case 'POST':
      response = await request.post(path, options);
      break;
    case 'GET':
      response = await request.get(path, options);
      break;
    case 'PUT':
      response = await request.put(path, options);
      break;
    case 'DELETE':
      response = await request.delete(path, options);
      break;
  }

  const status = response.status();
  const body = (await response.json().catch(() => null)) as T;

  return { status, body };
}
