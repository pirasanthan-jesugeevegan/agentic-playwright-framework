import { z } from 'zod';

export const userDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  title: z.string(),
  birth_day: z.string(),
  birth_month: z.string(),
  birth_year: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  company: z.string(),
  address1: z.string(),
  address2: z.string(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  zipcode: z.string(),
});
export type UserDetail = z.infer<typeof userDetailSchema>;

export const getUserDetailResponseSchema = z.object({
  responseCode: z.number(),
  user: userDetailSchema,
});
export type GetUserDetailResponse = z.infer<typeof getUserDetailResponseSchema>;
