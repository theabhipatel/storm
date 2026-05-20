import { z } from "zod";

// Order events are produced by order-service on Day 7; declared here so
// inventory/cart/recommendation consumers can subscribe today.
export const OrderEventTypes = {
  Created: "Order.Created.v1",
  Confirmed: "Order.Confirmed.v1",
  Failed: "Order.Failed.v1",
  StatusChanged: "Order.StatusChanged.v1",
  Cancelled: "Order.Cancelled.v1",
} as const;

export type OrderEventType = (typeof OrderEventTypes)[keyof typeof OrderEventTypes];

const OrderItem = z.object({
  sku: z.string(),
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
  pricePaise: z.number().int().nonnegative(),
});

export const OrderConfirmedPayload = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
  reservationId: z.string().uuid().nullable(),
  items: z.array(OrderItem),
  totalPaise: z.number().int().nonnegative(),
  currency: z.literal("INR"),
  paidAt: z.string().datetime(),
});

export const OrderFailedPayload = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
  reservationId: z.string().uuid().nullable(),
  reason: z.string(),
});

export const OrderCancelledPayload = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
  cancelledBy: z.enum(["user", "admin", "system"]),
});

export type OrderConfirmed = z.infer<typeof OrderConfirmedPayload>;
export type OrderFailed = z.infer<typeof OrderFailedPayload>;
export type OrderCancelled = z.infer<typeof OrderCancelledPayload>;
