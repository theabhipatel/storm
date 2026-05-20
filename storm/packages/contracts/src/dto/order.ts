import { z } from "zod";
import { SkuSchema, CurrencySchema } from "./catalog.js";

export const OrderStatusSchema = z.enum([
  "pending_payment",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentMethodSchema = z.enum(["razorpay"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const OrderAddressSnapshotSchema = z.object({
  addressId: z.string().uuid(),
  label: z.string(),
  fullName: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string().nullable().optional(),
  landmark: z.string().nullable().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.literal("IN").default("IN"),
});
export type OrderAddressSnapshot = z.infer<typeof OrderAddressSnapshotSchema>;

export const OrderItemImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
});

export const OrderLineItemSchema = z.object({
  id: z.string().uuid(),
  sku: SkuSchema,
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  name: z.string(),
  image: OrderItemImageSchema.nullable().optional(),
  unitPricePaise: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
  lineTotalPaise: z.number().int().nonnegative(),
});
export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: OrderStatusSchema,
  items: z.array(OrderLineItemSchema),
  itemsCount: z.number().int().nonnegative(),
  subtotalPaise: z.number().int().nonnegative(),
  shippingFeePaise: z.number().int().nonnegative(),
  totalPaise: z.number().int().nonnegative(),
  currency: CurrencySchema,
  address: OrderAddressSnapshotSchema,
  paymentMethod: PaymentMethodSchema,
  razorpayOrderId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  confirmedAt: z.string().datetime().nullable(),
});
export type Order = z.infer<typeof OrderSchema>;

export const OrderSummarySchema = OrderSchema.pick({
  id: true,
  status: true,
  itemsCount: true,
  totalPaise: true,
  currency: true,
  createdAt: true,
  confirmedAt: true,
}).extend({
  thumbnailUrl: z.string().url().nullable().optional(),
  firstItemName: z.string().optional(),
});
export type OrderSummary = z.infer<typeof OrderSummarySchema>;

export const CreateOrderRequestSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: PaymentMethodSchema.default("razorpay"),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

export const CreateOrderResponseSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string(),
  amountPaise: z.number().int().nonnegative(),
  currency: CurrencySchema,
  razorpayKeyId: z.string(),
});
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;

export const CheckoutInitItemSchema = z.object({
  sku: SkuSchema,
  productId: z.string().uuid(),
  name: z.string(),
  image: OrderItemImageSchema.nullable().optional(),
  unitPricePaise: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
  lineTotalPaise: z.number().int().nonnegative(),
  available: z.boolean(),
});
export const CheckoutInitResponseSchema = z.object({
  items: z.array(CheckoutInitItemSchema),
  itemsCount: z.number().int().nonnegative(),
  subtotalPaise: z.number().int().nonnegative(),
  shippingFeePaise: z.number().int().nonnegative(),
  totalPaise: z.number().int().nonnegative(),
  currency: CurrencySchema,
  freeShippingThresholdPaise: z.number().int().nonnegative(),
});
export type CheckoutInitItem = z.infer<typeof CheckoutInitItemSchema>;
export type CheckoutInitResponse = z.infer<typeof CheckoutInitResponseSchema>;

export const CancelOrderRequestSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type CancelOrderRequest = z.infer<typeof CancelOrderRequestSchema>;

export const OrderListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export const OrderListResponseSchema = z.object({
  items: z.array(OrderSummarySchema),
  nextCursor: z.string().nullable(),
});
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>;

export const AdminOrderListQuerySchema = z.object({
  status: OrderStatusSchema.optional(),
  q: z.string().max(200).optional(),
  customerId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type AdminOrderListQuery = z.infer<typeof AdminOrderListQuerySchema>;

export const AdminOrderUpdateStatusSchema = z.object({
  status: OrderStatusSchema,
  reason: z.string().max(500).optional(),
});
