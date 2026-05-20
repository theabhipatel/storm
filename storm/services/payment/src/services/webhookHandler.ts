import type { Logger } from "@storm/logger";

import type { PrismaClient } from "../db.js";
import type { PaymentService } from "./paymentService.js";

export interface WebhookHandler {
  process(input: {
    rawBody: string;
    signature: string;
    headerEventId?: string;
  }): Promise<{ status: "ok" | "duplicate" | "ignored"; eventId?: string }>;
}

interface RazorpayWebhookBody {
  event: string;
  id?: string;
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    order?: { entity: { id: string; amount: number; status: string } };
  };
}

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  status: string;
  method: string;
  amount: number;
  error_description?: string | null;
  captured_at?: number | null;
}

export function webhookHandler(deps: {
  prisma: PrismaClient;
  payments: PaymentService;
  verifySignature: (rawBody: string, signature: string) => boolean;
  logger: Logger;
}): WebhookHandler {
  const { prisma, payments, verifySignature, logger } = deps;

  return {
    async process({ rawBody, signature, headerEventId }) {
      if (!verifySignature(rawBody, signature)) {
        logger.warn("razorpay_webhook_bad_signature");
        const err = new Error("invalid_signature") as Error & { statusCode: number };
        err.statusCode = 400;
        throw err;
      }

      let parsed: RazorpayWebhookBody;
      try {
        parsed = JSON.parse(rawBody) as RazorpayWebhookBody;
      } catch (err) {
        logger.warn({ err }, "razorpay_webhook_invalid_json");
        const e = new Error("invalid_json") as Error & { statusCode: number };
        e.statusCode = 400;
        throw e;
      }

      const eventId =
        headerEventId ||
        parsed.id ||
        `${parsed.event}:${parsed.payload.payment?.entity.id ?? parsed.payload.order?.entity.id ?? "unknown"}`;

      try {
        await prisma.processedWebhookEvent.create({
          data: { razorpayEventId: eventId, eventType: parsed.event },
        });
      } catch (err: unknown) {
        if ((err as { code?: string }).code === "P2002") {
          logger.debug({ eventId }, "razorpay_webhook_duplicate");
          return { status: "duplicate", eventId };
        }
        throw err;
      }

      switch (parsed.event) {
        case "payment.captured": {
          const p = parsed.payload.payment?.entity;
          if (!p) return { status: "ignored", eventId };
          await payments.handlePaymentCaptured({
            razorpayOrderId: p.order_id,
            razorpayPaymentId: p.id,
            method: p.method,
            capturedAt: p.captured_at ? new Date(p.captured_at * 1000) : new Date(),
            amountPaise: p.amount,
          });
          return { status: "ok", eventId };
        }
        case "payment.failed": {
          const p = parsed.payload.payment?.entity;
          if (!p) return { status: "ignored", eventId };
          await payments.handlePaymentFailed({
            razorpayOrderId: p.order_id,
            razorpayPaymentId: p.id,
            reason: p.error_description ?? "payment_failed",
          });
          return { status: "ok", eventId };
        }
        case "order.paid":
          logger.debug({ eventId }, "razorpay_order_paid_noted");
          return { status: "ok", eventId };
        default:
          logger.debug({ eventType: parsed.event, eventId }, "razorpay_webhook_ignored");
          return { status: "ignored", eventId };
      }
    },
  };
}
