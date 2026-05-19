/**
 * Catalog DTOs — shared between admin app, web app, BFFs, and catalog-service.
 */
import { z } from "zod";

export const SlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated");

export const SkuSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Z0-9][A-Z0-9._-]*$/, "SKU may only contain A-Z, 0-9, dot, underscore, hyphen");

export const ProductStatusSchema = z.enum(["draft", "published", "archived"]);
export type ProductStatusDto = z.infer<typeof ProductStatusSchema>;

export const CurrencySchema = z.literal("INR");

const AttributesSchema = z.record(
  z.string().min(1).max(60),
  z.union([z.string(), z.number(), z.boolean()]),
);

// --- Categories ---

export const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: SlugSchema.optional(),
  parentId: z.string().uuid().nullable().optional(),
  order: z.number().int().min(0).default(0),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().uuid().nullable(),
  order: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CategoryDto = z.infer<typeof CategorySchema>;
export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;

export type CategoryTreeNode = CategoryDto & { children: CategoryTreeNode[] };

// --- Brands ---

export const BrandCreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: SlugSchema.optional(),
});

export const BrandUpdateSchema = BrandCreateSchema.partial();

export const BrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BrandDto = z.infer<typeof BrandSchema>;

// --- Variants ---

export const VariantCreateSchema = z.object({
  sku: SkuSchema,
  name: z.string().min(1).max(160),
  price: z.number().int().nonnegative().nullable().optional(),
  attributes: AttributesSchema.optional(),
});

export const VariantUpdateSchema = VariantCreateSchema.partial();

export const VariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  price: z.number().int().nullable(),
  attributes: AttributesSchema,
});

export type VariantDto = z.infer<typeof VariantSchema>;

// --- Products ---

export const ProductCreateSchema = z.object({
  sku: SkuSchema,
  slug: SlugSchema.optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(20000).default(""),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  basePrice: z.number().int().nonnegative(),
  currency: CurrencySchema.default("INR"),
  attributes: AttributesSchema.optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const ProductMediaSchema = z.object({
  mediaId: z.string().uuid(),
  order: z.number().int().min(0),
  isPrimary: z.boolean(),
});

export const ProductMediaAttachSchema = z.object({
  mediaId: z.string().uuid(),
  order: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

export const AdminProductListQuerySchema = z.object({
  q: z.string().max(200).optional(),
  status: ProductStatusSchema.optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const AdminProductSummarySchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  slug: z.string(),
  name: z.string(),
  status: ProductStatusSchema,
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  basePrice: z.number().int(),
  currency: z.string(),
  primaryMediaId: z.string().uuid().nullable(),
  updatedAt: z.string().datetime(),
});

export const ProductDetailSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  basePrice: z.number().int(),
  currency: z.string(),
  status: ProductStatusSchema,
  attributes: AttributesSchema,
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  variants: z.array(VariantSchema),
  media: z.array(ProductMediaSchema),
});

export type ProductDetail = z.infer<typeof ProductDetailSchema>;
export type AdminProductSummary = z.infer<typeof AdminProductSummarySchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
