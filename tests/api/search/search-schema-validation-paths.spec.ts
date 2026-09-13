// spec: docs/api-test-plans/search-api-test-plan.md
import { attachJson } from '../../../src/fixtures/api/attach-json';
import { searchProductsResponseSchema } from '../../../src/fixtures/api/schemas/products/products-schema';
import { expect, test } from '../../../src/fixtures/pom/test-options';

test.describe('Search API', { tag: '@regression' }, () => {
  test('API-05: Verify that the API safely returns no matches for a search_product value containing special characters', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/searchProduct',
      form: { search_product: "' OR 1=1 --" },
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = searchProductsResponseSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(200);
    expect(parsed.products).toEqual([]);
  });

  test('API-06: Verify that the API treats an empty search_product value as matching every product', async ({
    apiRequest,
  }, testInfo) => {
    // An empty value matches every product rather than none - a quirk of this endpoint.
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/searchProduct',
      form: { search_product: '' },
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = searchProductsResponseSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(200);
    expect(parsed.products.length).toBeGreaterThan(10);
  });
});
