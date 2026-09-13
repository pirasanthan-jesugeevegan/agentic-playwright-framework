// spec: docs/api-test-plans/account-api-test-plan.md
import { attachJson } from '../../../src/fixtures/api/attach-json';
import { getUserDetailResponseSchema } from '../../../src/fixtures/api/schemas/account/account-schema';
import { apiResultSchema } from '../../../src/fixtures/api/schemas/util/api-result-schema';
import { expect, test } from '../../../src/fixtures/pom/test-options';
import { KNOWN_ACCOUNT } from '../../../src/data/known-account';

test.describe('Account API', { tag: '@regression' }, () => {
  test('API-06: Verify that the API confirms an existing account for valid login credentials', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/verifyLogin',
      form: { email: KNOWN_ACCOUNT.email, password: KNOWN_ACCOUNT.password },
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(200);
    expect(parsed.message).toContain('User exists');
  });

  test('API-07: Verify that the API returns the correct account details for a known email', async ({
    apiRequest,
  }, testInfo) => {
    const { status, body } = await apiRequest({
      method: 'GET',
      url: '/getUserDetailByEmail',
      params: { email: KNOWN_ACCOUNT.email },
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = getUserDetailResponseSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(200);
    expect(parsed.user.email).toBe(KNOWN_ACCOUNT.email);
  });
});
