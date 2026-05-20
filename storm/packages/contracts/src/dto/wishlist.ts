import { z } from "zod";
import { SkuSchema, CurrencySchema } from "./catalog.js";

export const WISHLIST_MAX_ITEMS = 200;

export const WishlistItemSchema = z.object({
  sku: SkuSchema,
  productId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  primaryImageUrl: z.string().url().nullable().optional(),
  currentPrice: z.number().int().nonnegative(),
  currency: CurrencySchema,
  available: z.boolean(),
  addedAt: z.string().datetime(),
});
export type WishlistItem = z.infer<typeof WishlistItemSchema>;

export const WishlistSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(WishlistItemSchema),
  itemCount: z.number().int().nonnegative(),
});
export type Wishlist = z.infer<typeof WishlistSchema>;

export const WishlistAddItemSchema = z.object({
  sku: SkuSchema,
});
export type WishlistAddItemInput = z.infer<typeof WishlistAddItemSchema>;
