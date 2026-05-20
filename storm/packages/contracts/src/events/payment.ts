import { z } from "zod";

export const PaymentEventTypes = {
  Captured: "Payment.Captured.v1",
  Failed: "Payment.Failed.v1",
} as const;

export type PaymentEventType = (typeof PaymentEventTypes)[keyof typeof PaymentEventTypes];

export const PaymentCapturedPayload = z.object({
  paymentId: z.string().uuid(),
  orderId: z.string().uuid(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  amountPaise: z.number().int().nonnegative(),
  currency: z.literal("INR"),
  method: z.string(),
  capturedAt: z.string().datetime(),
});

export const PaymentFailedPayload = z.object({
  paymentId: z.string().uuid(),
  orderId: z.string().uuid(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().nullable(),
  reason: z.string(),
  failedAt: z.string().datetime(),
});

export type PaymentCaptured = z.infer<typeof PaymentCapturedPayload>;
export type PaymentFailed = z.infer<typeof PaymentFailedPayload>;
