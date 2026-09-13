import { z } from 'zod';

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(),
  brand: z.string(),
  category: z.object({
    usertype: z.object({
      usertype: z.string(),
    }),
    category: z.string(),
  }),
});
export type Product = z.infer<typeof productSchema>;

export const searchProductsResponseSchema = z.object({
  responseCode: z.number(),
  products: z.array(productSchema),
});
export type SearchProductsResponse = z.infer<
  typeof searchProductsResponseSchema
>;
