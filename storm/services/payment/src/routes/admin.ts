import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { StormError, ErrorCodes } from "@storm/contracts";

import type { PaymentRepo } from "../repositories/paymentRepo.js";
import type { PrismaClient, PaymentStatus } from "../db.js";

const AdminListQuery = z.object({
  status: z.enum(["created", "captured", "failed"]).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function adminRouter(deps: { repo: PaymentRepo; prisma: PrismaClient }): Router {
  const router = Router();

  router.get("/api/admin/payments", asyncRoute(async (req, res) => {
    const q = AdminListQuery.parse(req.query);
    const { items, nextCursor } = await deps.repo.listForAdmin({
      ...(q.status ? { status: q.status as PaymentStatus } : {}),
      ...(q.cursor ? { cursor: q.cursor } : {}),
      limit: q.limit,
    });
    res.json({
      items: items.map((p) => ({
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
      })),
      nextCursor,
    });
  }));

  router.get(
    "/api/admin/payments/reconciliation/:date",
    asyncRoute(async (req, res) => {
      const raw = req.params.date ?? "";
      const date = parseIsoDateOnly(raw);
      if (!date) {
        throw new StormError({
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Invalid date; expected YYYY-MM-DD.",
          status: 400,
        });
      }
      const report = await deps.prisma.reconciliationReport.findUnique({
        where: { forDate: date },
      });
      if (!report) {
        throw new StormError({
          code: ErrorCodes.NOT_FOUND,
          message: "No reconciliation report for that date.",
          status: 404,
        });
      }
      res.json({
        id: report.id,
        forDate: report.forDate.toISOString().slice(0, 10),
        ourCount: report.ourCount,
        razorpayCount: report.razorpayCount,
        matchedCount: report.matchedCount,
        missingInOurs: report.missingInOurs,
        missingInRzp: report.missingInRzp,
        mismatches: report.mismatches,
        generatedAt: report.generatedAt.toISOString(),
      });
    }),
  );

  return router;
}

function parseIsoDateOnly(raw: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function asyncRoute(fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
