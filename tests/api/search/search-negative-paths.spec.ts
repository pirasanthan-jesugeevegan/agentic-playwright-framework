// spec: docs/api-test-plans/search-api-test-plan.md
import { attachJson } from '../../../src/fixtures/api/attach-json';
import { apiResultSchema } from '../../../src/fixtures/api/schemas/util/api-result-schema';
import { expect, test } from '../../../src/fixtures/pom/test-options';

test.describe('Search API', { tag: '@regression' }, () => {
  test('API-03: Verify that the API rejects a search request with no search_product parameter', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/searchProduct',
    });
    await attachJson(testInfo, 'response', body);

    // This API returns HTTP 200 and puts the real result in responseCode.
    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(400);
    expect(parsed.message).toContain('search_product parameter is missing');
  });

  test('API-04: Verify that the API rejects a GET request to the search endpoint', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'GET',
      url: '/searchProduct',
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(405);
    expect(parsed.message).toContain('not supported');
  });
});
