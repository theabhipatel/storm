/**
 * Search DTOs — shared between search-service, web-bff, and apps/web.
 */
import { z } from "zod";

export const SearchSortSchema = z.enum([
  "relevance",
  "price-asc",
  "price-desc",
  "popularity",
  "newness",
]);
export type SearchSort = z.infer<typeof SearchSortSchema>;

export const SearchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : undefined)),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().nonnegative().optional(),
  inStock: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sort: SearchSortSchema.default("relevance"),
  cursor: z.string().max(2000).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type SearchQueryInput = z.input<typeof SearchQuerySchema>;
export type SearchQueryParsed = z.infer<typeof SearchQuerySchema>;

export const SearchHitSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string(),
  slug: z.string(),
  name: z.string(),
  brandId: z.string().uuid(),
  brandName: z.string(),
  categoryIds: z.array(z.string().uuid()),
  categoryNames: z.array(z.string()),
  basePrice: z.number().int(),
  currency: z.string(),
  inStock: z.boolean(),
  primaryImageUrl: z.string().nullable(),
  popularityScore: z.number(),
  createdAt: z.string().datetime(),
});
export type SearchHit = z.infer<typeof SearchHitSchema>;

export const PageMetaSchema = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  limit: z.number().int(),
});
export type PageMeta = z.infer<typeof PageMetaSchema>;

export const SearchResponseSchema = z.object({
  data: z.array(SearchHitSchema),
  page: PageMetaSchema,
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const AutocompleteItemSchema = z.object({
  kind: z.enum(["product", "category"]),
  id: z.string(),
  label: z.string(),
  slug: z.string(),
  primaryImageUrl: z.string().nullable().optional(),
  basePrice: z.number().int().nullable().optional(),
  currency: z.string().nullable().optional(),
});
export type AutocompleteItem = z.infer<typeof AutocompleteItemSchema>;

export const AutocompleteResponseSchema = z.object({
  items: z.array(AutocompleteItemSchema),
});
export type AutocompleteResponse = z.infer<typeof AutocompleteResponseSchema>;

export const FacetBucketSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
});
export type FacetBucket = z.infer<typeof FacetBucketSchema>;

export const PriceBucketSchema = z.object({
  from: z.number().int(),
  to: z.number().int().nullable(),
  count: z.number().int().nonnegative(),
});
export type PriceBucket = z.infer<typeof PriceBucketSchema>;

export const FacetsResponseSchema = z.object({
  brands: z.array(FacetBucketSchema),
  categories: z.array(FacetBucketSchema),
  priceBuckets: z.array(PriceBucketSchema),
  inStockCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
});
export type FacetsResponse = z.infer<typeof FacetsResponseSchema>;
