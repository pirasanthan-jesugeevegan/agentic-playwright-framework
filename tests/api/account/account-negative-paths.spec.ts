// spec: docs/api-test-plans/account-api-test-plan.md
import { attachJson } from '../../../src/fixtures/api/attach-json';
import { apiResultSchema } from '../../../src/fixtures/api/schemas/util/api-result-schema';
import { expect, test } from '../../../src/fixtures/pom/test-options';

test.describe('Account API', { tag: '@regression' }, () => {
  test('API-08: Verify that the API rejects login verification for a nonexistent account', async ({
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
});
