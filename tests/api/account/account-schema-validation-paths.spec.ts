// spec: docs/api-test-plans/account-api-test-plan.md
import { attachJson } from '../../../src/fixtures/api/attach-json';
import { apiResultSchema } from '../../../src/fixtures/api/schemas/util/api-result-schema';
import { expect, test } from '../../../src/fixtures/pom/test-options';
import { generateAccountPayload } from '../../../src/data/account-payload';

test.describe('Account API', { tag: '@regression' }, () => {
  // Whichever email a test creates is deleted in afterEach, pass or fail.
  let createdEmail: string | undefined;

  test.beforeEach(() => {
    createdEmail = undefined;
  });

  test.afterEach(async ({ apiRequest }) => {
    if (!createdEmail) {
      return;
    }
    await apiRequest({
      method: 'DELETE',
      url: '/deleteAccount',
      form: { email: createdEmail, password: 'Test1234!' },
    });
  });

  test('API-12: Verify that the API rejects account creation when the email field is missing', async ({
    apiRequest,
  }, testInfo) => {
    const payload = generateAccountPayload();
    const { email, ...bodyWithoutEmail } = payload;
    void email;

    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/createAccount',
      form: bodyWithoutEmail,
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(400);
    expect(parsed.message).toContain('email parameter is missing');
  });

  test('API-13: Verify that the API creates an account when given a complete, valid payload', async ({
    apiRequest,
  }, testInfo) => {
    const payload = generateAccountPayload();

    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/createAccount',
      form: payload,
    });
    await attachJson(testInfo, 'response', body);

    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(201);
    expect(parsed.message).toContain('User created');

    createdEmail = payload.email;
  });

  test('API-14: Verify that the API rejects account creation with an email that already exists', async ({
    apiRequest,
  }, testInfo) => {
    const payload = generateAccountPayload();

    const created = await apiRequest({
      method: 'POST',
      url: '/createAccount',
      form: payload,
    });
    const createdBody = apiResultSchema.parse(created.body);
    expect(createdBody.responseCode).toBe(201);
    createdEmail = payload.email;

    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/createAccount',
      form: payload,
    });
    await attachJson(testInfo, 'duplicate-response', body);

    expect(status).toBe(200);
    const parsed = apiResultSchema.parse(body);
    expect(parsed).toBeTruthy();
    expect(parsed.responseCode).toBe(400);
    expect(parsed.message).toContain('Email already exists');
  });
});
