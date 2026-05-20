import { uuidv7 } from "uuidv7";

import type { Payment, PaymentStatus, PrismaClient } from "../db.js";

export interface PaymentRepo {
  create(input: {
    orderId: string;
    razorpayOrderId: string;
    amountPaise: number;
    currency: "INR";
  }): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null>;
  findByRazorpayPaymentId(razorpayPaymentId: string): Promise<Payment | null>;
  setCaptured(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    method: string;
    capturedAt: Date;
  }): Promise<Payment>;
  setFailed(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    reason: string;
  }): Promise<Payment>;
  listForAdmin(input: {
    status?: PaymentStatus;
    cursor?: string;
    limit: number;
  }): Promise<{ items: Payment[]; nextCursor: string | null }>;
}

export function paymentRepo(prisma: PrismaClient): PaymentRepo {
  return {
    async create(input) {
      return prisma.payment.create({
        data: {
          id: uuidv7(),
          orderId: input.orderId,
          razorpayOrderId: input.razorpayOrderId,
          amountPaise: input.amountPaise,
          currency: input.currency,
          status: "created",
        },
      });
    },

    async findById(id) {
      return prisma.payment.findUnique({ where: { id } });
    },

    async findByRazorpayOrderId(razorpayOrderId) {
      return prisma.payment.findFirst({
        where: { razorpayOrderId },
        orderBy: { createdAt: "desc" },
      });
    },

    async findByRazorpayPaymentId(razorpayPaymentId) {
      return prisma.payment.findFirst({ where: { razorpayPaymentId } });
    },

    async setCaptured(input) {
      const updated = await prisma.payment.updateMany({
        where: { razorpayOrderId: input.razorpayOrderId, status: { not: "captured" } },
        data: {
          status: "captured",
          razorpayPaymentId: input.razorpayPaymentId,
          method: input.method,
          capturedAt: input.capturedAt,
        },
      });
      if (updated.count === 0) {
        const existing = await prisma.payment.findFirst({
          where: { razorpayOrderId: input.razorpayOrderId },
          orderBy: { createdAt: "desc" },
        });
        if (existing) return existing;
        throw new Error(`payment not found for razorpayOrderId=${input.razorpayOrderId}`);
      }
      const fresh = await prisma.payment.findFirst({
        where: { razorpayOrderId: input.razorpayOrderId },
        orderBy: { createdAt: "desc" },
      });
      if (!fresh) throw new Error("payment row vanished after update");
      return fresh;
    },

    async setFailed(input) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: input.razorpayOrderId, status: { not: "failed" } },
        data: {
          status: "failed",
          razorpayPaymentId: input.razorpayPaymentId,
          failureReason: input.reason,
        },
      });
      const fresh = await prisma.payment.findFirst({
        where: { razorpayOrderId: input.razorpayOrderId },
        orderBy: { createdAt: "desc" },
      });
      if (!fresh) throw new Error(`payment not found for razorpayOrderId=${input.razorpayOrderId}`);
      return fresh;
    },

    async listForAdmin({ status, cursor, limit }) {
      const where = status ? { status } : {};
      const rows = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      const items = rows.slice(0, limit);
      const nextCursor = rows.length > limit ? items[items.length - 1]!.id : null;
      return { items, nextCursor };
    },
  };
}
