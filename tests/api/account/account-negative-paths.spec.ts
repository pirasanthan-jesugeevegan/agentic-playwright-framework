// spec: docs/api-test-plans/account-api-test-plan.md
import { attachJson } from '../../../src/fixtures/api/attach-json';
import { apiResultSchema } from '../../../src/fixtures/api/schemas/util/api-result-schema';
import { expect, test } from '../../../src/fixtures/pom/test-options';

test.describe('Account API', { tag: '@regression' }, () => {
  test('API-09: Verify that the API rejects login verification for a nonexistent account', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/verifyLogin',
      form: {
        email: 'definitely-not-a-real-account@example.com',
        password: 'whatever-it-does-not-matter',
      },
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(404);
    expect(parsed.message).toContain('not found');
  });

  test('API-10: Verify that the API rejects a login verification request missing the email parameter', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/verifyLogin',
      form: { password: 'Test1234!' },
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(400);
    expect(parsed.message).toContain('parameter is missing');
  });

  test('API-11: Verify that the API rejects a DELETE request to the login verification endpoint', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'DELETE',
      url: '/verifyLogin',
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(405);
    expect(parsed.message).toContain('not supported');
  });
});
