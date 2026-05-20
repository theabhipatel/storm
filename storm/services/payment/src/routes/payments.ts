import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { StormError, ErrorCodes } from "@storm/contracts";

import type { PaymentService } from "../services/paymentService.js";
import type { PaymentRepo } from "../repositories/paymentRepo.js";
import type { RazorpayClient } from "../services/razorpayClient.js";

const CreatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  amountPaise: z.number().int().positive(),
  currency: z.literal("INR").default("INR"),
});

export function paymentsRouter(deps: {
  service: PaymentService;
  repo: PaymentRepo;
  razorpay: RazorpayClient;
}): Router {
  const router = Router();

  router.post("/api/internal/payments", asyncRoute(async (req, res) => {
    const body = CreatePaymentSchema.parse(req.body);
    const payment = await deps.service.createForOrder(body);
    res.status(201).json({
      paymentId: payment.id,
      razorpayOrderId: payment.razorpayOrderId,
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      razorpayKeyId: deps.razorpay.keyId,
    });
  }));

  router.get("/api/internal/payments/:id", asyncRoute(async (req, res) => {
    const payment = await deps.repo.findById(req.params.id!);
    if (!payment) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Payment not found.",
        status: 404,
      });
    }
    res.json(serialise(payment));
  }));

  router.get("/api/internal/payments/by-razorpay-order/:razorpayOrderId", asyncRoute(async (req, res) => {
    const payment = await deps.repo.findByRazorpayOrderId(req.params.razorpayOrderId!);
    if (!payment) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Payment not found.",
        status: 404,
      });
    }
    res.json(serialise(payment));
  }));

  return router;
}

function serialise(p: {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  method: string | null;
  status: string;
  capturedAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
}) {
  return {
    id: p.id,
    orderId: p.orderId,
    razorpayOrderId: p.razorpayOrderId,
    razorpayPaymentId: p.razorpayPaymentId,
    amountPaise: p.amountPaise,
    currency: p.currency,
    method: p.method,
    status: p.status,
    capturedAt: p.capturedAt?.toISOString() ?? null,
    failureReason: p.failureReason,
    createdAt: p.createdAt.toISOString(),
  };
}

function asyncRoute(fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
