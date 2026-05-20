import { z } from "zod";
import { SkuSchema, CurrencySchema } from "./catalog.js";

export const CART_MAX_DISTINCT_ITEMS = 50;
export const CART_MAX_QTY_PER_SKU = 10;

export const CartItemSchema = z.object({
  sku: SkuSchema,
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  name: z.string(),
  slug: z.string(),
  primaryImageUrl: z.string().url().nullable().optional(),
  qty: z.number().int().min(1).max(CART_MAX_QTY_PER_SKU),
  priceSnapshot: z.number().int().nonnegative(),
  currentPrice: z.number().int().nonnegative(),
  currency: CurrencySchema,
  priceChanged: z.boolean(),
  available: z.boolean(),
  addedAt: z.string().datetime(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  userId: z.string().uuid().nullable(),
  items: z.array(CartItemSchema),
  itemCount: z.number().int().nonnegative(),
  subtotalPaise: z.number().int().nonnegative(),
  currency: CurrencySchema,
  updatedAt: z.string().datetime(),
});
export type Cart = z.infer<typeof CartSchema>;

export const CartAddItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  qty: z.number().int().min(1).max(CART_MAX_QTY_PER_SKU).default(1),
});
export type CartAddItemInput = z.infer<typeof CartAddItemSchema>;

export const CartUpdateItemSchema = z.object({
  qty: z.number().int().min(1).max(CART_MAX_QTY_PER_SKU),
});
export type CartUpdateItemInput = z.infer<typeof CartUpdateItemSchema>;

export const CartMergeItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  sku: SkuSchema.optional(),
  qty: z.number().int().min(1).max(CART_MAX_QTY_PER_SKU),
});

export const CartMergeSchema = z.object({
  items: z.array(CartMergeItemSchema).max(CART_MAX_DISTINCT_ITEMS),
});
export type CartMergeInput = z.infer<typeof CartMergeSchema>;
