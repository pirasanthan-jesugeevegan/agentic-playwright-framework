import type { TestInfo } from '@playwright/test';

/**
 * Attaches a JSON value to the test report as a viewable attachment.
 *
 * @example
 * ```ts
 * await attachJson(testInfo, 'response', body);
 * ```
 */
export async function attachJson(
  testInfo: TestInfo,
  name: string,
  data: unknown,
): Promise<void> {
  await testInfo.attach(name, {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });
}
