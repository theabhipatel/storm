import {
  PaymentEventTypes,
  type PaymentCaptured,
  type PaymentFailed,
} from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { Payment, PrismaClient } from "../db.js";
import { appendOutbox } from "../outbox/writer.js";
import type { PaymentRepo } from "../repositories/paymentRepo.js";
import type { RazorpayClient } from "./razorpayClient.js";

export interface PaymentService {
  createForOrder(input: {
    orderId: string;
    amountPaise: number;
    currency: "INR";
  }): Promise<Payment>;
  handlePaymentCaptured(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    method: string;
    capturedAt: Date;
    amountPaise: number;
  }): Promise<Payment>;
  handlePaymentFailed(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    reason: string;
  }): Promise<Payment>;
}

export function paymentService(deps: {
  prisma: PrismaClient;
  repo: PaymentRepo;
  razorpay: RazorpayClient;
  logger: Logger;
}): PaymentService {
  const { prisma, repo, razorpay, logger } = deps;

  return {
    async createForOrder(input) {
      const rzpOrder = await razorpay.createOrder({
        amountPaise: input.amountPaise,
        currency: input.currency,
        receipt: input.orderId,
        notes: { storm_order_id: input.orderId },
      });
      const payment = await repo.create({
        orderId: input.orderId,
        razorpayOrderId: rzpOrder.id,
        amountPaise: input.amountPaise,
        currency: input.currency,
      });
      logger.info({ orderId: input.orderId, razorpayOrderId: rzpOrder.id }, "payment_created");
      return payment;
    },

    async handlePaymentCaptured(input) {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.payment.findFirst({
          where: { razorpayOrderId: input.razorpayOrderId },
          orderBy: { createdAt: "desc" },
        });
        if (!existing) {
          throw new Error(`payment not found for razorpayOrderId=${input.razorpayOrderId}`);
        }
        if (existing.status === "captured") {
          return existing;
        }
        await tx.payment.update({
          where: { id: existing.id },
          data: {
            status: "captured",
            razorpayPaymentId: input.razorpayPaymentId,
            method: input.method,
            capturedAt: input.capturedAt,
          },
        });
        const updated = await tx.payment.findUniqueOrThrow({ where: { id: existing.id } });

        const payload: PaymentCaptured = {
          paymentId: updated.id,
          orderId: updated.orderId,
          razorpayOrderId: updated.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          amountPaise: updated.amountPaise,
          currency: "INR",
          method: input.method,
          capturedAt: input.capturedAt.toISOString(),
        };
        await appendOutbox(tx, {
          aggregateId: updated.orderId,
          eventType: PaymentEventTypes.Captured,
          payload: payload as unknown as Record<string, unknown>,
        });
        return updated;
      });
    },

    async handlePaymentFailed(input) {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.payment.findFirst({
          where: { razorpayOrderId: input.razorpayOrderId },
          orderBy: { createdAt: "desc" },
        });
        if (!existing) {
          throw new Error(`payment not found for razorpayOrderId=${input.razorpayOrderId}`);
        }
        if (existing.status === "failed" || existing.status === "captured") {
          return existing;
        }
        await tx.payment.update({
          where: { id: existing.id },
          data: {
            status: "failed",
            razorpayPaymentId: input.razorpayPaymentId,
            failureReason: input.reason,
          },
        });
        const updated = await tx.payment.findUniqueOrThrow({ where: { id: existing.id } });

        const payload: PaymentFailed = {
          paymentId: updated.id,
          orderId: updated.orderId,
          razorpayOrderId: updated.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          reason: input.reason,
          failedAt: new Date().toISOString(),
        };
        await appendOutbox(tx, {
          aggregateId: updated.orderId,
          eventType: PaymentEventTypes.Failed,
          payload: payload as unknown as Record<string, unknown>,
        });
        return updated;
      });
    },
  };
}
