import { z } from "zod";

export const RecommendedProductSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string(),
  slug: z.string(),
  name: z.string(),
  primaryImageUrl: z.string().url().nullable().optional(),
  basePrice: z.number().int().nonnegative(),
  currency: z.literal("INR"),
  brandName: z.string().optional(),
  inStock: z.boolean(),
});
export type RecommendedProduct = z.infer<typeof RecommendedProductSchema>;

export const RecommendationListSchema = z.object({
  source: z.enum(["product", "category", "user", "popular"]),
  items: z.array(RecommendedProductSchema),
});
export type RecommendationList = z.infer<typeof RecommendationListSchema>;
