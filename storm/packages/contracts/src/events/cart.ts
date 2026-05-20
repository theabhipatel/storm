import { z } from "zod";

export const CartEventTypes = {
  ItemAdded: "Cart.ItemAdded.v1",
} as const;

export type CartEventType = (typeof CartEventTypes)[keyof typeof CartEventTypes];

export const CartItemAddedPayload = z.object({
  userId: z.string().uuid(),
  sku: z.string(),
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
});

export type CartItemAdded = z.infer<typeof CartItemAddedPayload>;
