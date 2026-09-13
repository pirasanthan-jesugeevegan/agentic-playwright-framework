import { z } from 'zod';

/**
 * automationexercise.com's API almost always returns HTTP 200 and puts the
 * real result in the response body's `responseCode` field. `createAccount`
 * called with the wrong HTTP method is the one exception (real HTTP 405).
 */
export const apiResultSchema = z.object({
  responseCode: z.number(),
  message: z.string(),
});
export type ApiResult = z.infer<typeof apiResultSchema>;
