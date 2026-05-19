import { z } from "zod";

export const CatalogEventTypes = {
  ProductCreated: "Product.Created.v1",
  ProductUpdated: "Product.Updated.v1",
  ProductPublished: "Product.Published.v1",
  ProductArchived: "Product.Archived.v1",
  CategoryCreated: "Category.Created.v1",
  CategoryUpdated: "Category.Updated.v1",
  BrandCreated: "Brand.Created.v1",
  BrandUpdated: "Brand.Updated.v1",
} as const;

export type CatalogEventType =
  (typeof CatalogEventTypes)[keyof typeof CatalogEventTypes];

export const ProductStatusEnum = z.enum(["draft", "published", "archived"]);
export type ProductStatus = z.infer<typeof ProductStatusEnum>;

const ProductSnapshot = z.object({
  productId: z.string().uuid(),
  sku: z.string(),
  slug: z.string(),
  name: z.string(),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  basePrice: z.number().int().nonnegative(),
  currency: z.string(),
  status: ProductStatusEnum,
});

export const ProductCreatedPayload = ProductSnapshot;
export const ProductUpdatedPayload = ProductSnapshot.extend({
  changedFields: z.array(z.string()).optional(),
});
export const ProductPublishedPayload = ProductSnapshot.extend({
  publishedAt: z.string().datetime(),
});
export const ProductArchivedPayload = ProductSnapshot;

export const CategoryEventPayload = z.object({
  categoryId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().uuid().nullable(),
});

export const BrandEventPayload = z.object({
  brandId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
});

export type ProductCreated = z.infer<typeof ProductCreatedPayload>;
export type ProductUpdated = z.infer<typeof ProductUpdatedPayload>;
export type ProductPublished = z.infer<typeof ProductPublishedPayload>;
export type ProductArchived = z.infer<typeof ProductArchivedPayload>;
export type CategoryEvent = z.infer<typeof CategoryEventPayload>;
export type BrandEvent = z.infer<typeof BrandEventPayload>;
