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
      response = await request.post(url, options);
      break;
    case 'GET':
      response = await request.get(url, options);
      break;
    case 'PUT':
      response = await request.put(url, options);
      break;
    case 'DELETE':
      response = await request.delete(url, options);
      break;
  }

  const status = response.status();
  const body = (await response.json().catch(() => null)) as T;

  return { status, body };
}
