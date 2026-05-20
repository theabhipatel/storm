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

const OrderAddressSnapshot = z.object({
  fullName: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string().nullable().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string().default("IN"),
});

export const OrderCreatedPayload = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
  reservationId: z.string().uuid().nullable(),
  razorpayOrderId: z.string(),
  items: z.array(OrderItem),
  subtotalPaise: z.number().int().nonnegative(),
  shippingFeePaise: z.number().int().nonnegative(),
  totalPaise: z.number().int().nonnegative(),
  currency: z.literal("INR"),
  address: OrderAddressSnapshot,
  createdAt: z.string().datetime(),
});

export const OrderConfirmedPayload = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
  reservationId: z.string().uuid().nullable(),
  items: z.array(OrderItem),
  subtotalPaise: z.number().int().nonnegative().optional(),
  shippingFeePaise: z.number().int().nonnegative().optional(),
  totalPaise: z.number().int().nonnegative(),
  currency: z.literal("INR"),
  address: OrderAddressSnapshot.optional(),
  paidAt: z.string().datetime(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
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
  reason: z.string().optional(),
  cancelledAt: z.string().datetime(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  phone: z.string().optional(),
});

export const OrderStatusChangedPayload = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
  fromStatus: z.string(),
  toStatus: z.string(),
  changedAt: z.string().datetime(),
  changedBy: z.string(),
  reason: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  phone: z.string().optional(),
});

export type OrderCreated = z.infer<typeof OrderCreatedPayload>;
export type OrderConfirmed = z.infer<typeof OrderConfirmedPayload>;
export type OrderFailed = z.infer<typeof OrderFailedPayload>;
export type OrderCancelled = z.infer<typeof OrderCancelledPayload>;
export type OrderStatusChanged = z.infer<typeof OrderStatusChangedPayload>;
