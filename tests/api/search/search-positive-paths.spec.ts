// spec: docs/api-test-plans/search-api-test-plan.md
import { attachJson } from '../../../src/fixtures/api/attach-json';
import { searchProductsResponseSchema } from '../../../src/fixtures/api/schemas/products/products-schema';
import { expect, test } from '../../../src/fixtures/pom/test-options';

test.describe('Search API', { tag: '@regression' }, () => {
  test('API-01: Verify that the API returns matching products for a known search term', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/searchProduct',
      form: { search_product: 'top' },
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = searchProductsResponseSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(200);
    expect(parsed.products.length).toBeGreaterThan(0);
    // The API matches on name or category ("Tops & Shirts"), not name alone.
    expect(
      parsed.products.every(
        (product) =>
          product.name.toLowerCase().includes('top') ||
          product.category.category.toLowerCase().includes('top'),
      ),
    ).toBe(true);
  });

  test('API-02: Verify that the API returns an empty product list for a search term that matches nothing', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/searchProduct',
      form: { search_product: '99999999' },
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = searchProductsResponseSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(200);
    expect(parsed.products).toEqual([]);
  });
});
