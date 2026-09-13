export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Parameters accepted by the `apiRequest` fixture. */
export interface ApiRequestParams {
  method: HttpMethod;
  /** Path relative to the project's configured baseURL. */
  url: string;
  /** Form-encoded body fields (application/x-www-form-urlencoded). */
  form?: Record<string, string | number | boolean>;
  /** Query-string parameters. */
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

export interface ApiRequestResponse<T = unknown> {
  status: number;
  body: T;
}

export type ApiRequestFn = <T = unknown>(
  params: ApiRequestParams,
) => Promise<ApiRequestResponse<T>>;

export interface ApiRequestMethods {
  apiRequest: ApiRequestFn;
}
