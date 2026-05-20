import { uuidv7 } from "uuidv7";
import type { Logger } from "@storm/logger";

import type { PrismaClient } from "../db.js";
import type { RazorpayClient } from "./razorpayClient.js";

export interface ReconciliationWorker {
  runForDate(date: Date): Promise<{ id: string; mismatches: number }>;
  start(): void;
  stop(): Promise<void>;
}

export function createReconciliationWorker(deps: {
  prisma: PrismaClient;
  razorpay: RazorpayClient;
  logger: Logger;
  intervalMs?: number;
}): ReconciliationWorker {
  // For Stage-1 dev we poll on a fixed interval rather than running a real cron;
  // production deploys can replace this with a cron job + leader election.
  const intervalMs = deps.intervalMs ?? 24 * 60 * 60 * 1000;
  let timer: NodeJS.Timeout | null = null;
  let stopped = false;
  let inflight = false;

  async function runForDate(date: Date) {
    if (deps.razorpay.isStub) {
      deps.logger.info("reconciliation_skipped_stub_mode");
    }
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const rzpPayments = await deps.razorpay.listPaymentsForDay(startOfDay);
    const ours = await deps.prisma.payment.findMany({
      where: { createdAt: { gte: startOfDay, lt: endOfDay } },
    });
    const oursByRzpPaymentId = new Map(
      ours.filter((p) => p.razorpayPaymentId).map((p) => [p.razorpayPaymentId!, p]),
    );

    const missingInOurs: { razorpayPaymentId: string; amount: number; status: string }[] = [];
    const mismatches: { razorpayPaymentId: string; ourStatus: string; theirStatus: string }[] = [];
    let matched = 0;
    for (const r of rzpPayments) {
      const ours = oursByRzpPaymentId.get(r.id);
      if (!ours) {
        missingInOurs.push({ razorpayPaymentId: r.id, amount: r.amount, status: r.status });
        continue;
      }
      const expectedStatus = r.status === "captured" ? "captured" : r.status === "failed" ? "failed" : "created";
      if (ours.status !== expectedStatus) {
        mismatches.push({ razorpayPaymentId: r.id, ourStatus: ours.status, theirStatus: r.status });
      } else {
        matched += 1;
      }
    }
    const rzpById = new Set(rzpPayments.map((r) => r.id));
    const missingInRzp = ours
      .filter(
        (p) =>
          p.razorpayPaymentId &&
          !rzpById.has(p.razorpayPaymentId) &&
          (p.status === "captured" || p.status === "failed"),
      )
      .map((p) => ({ paymentId: p.id, razorpayPaymentId: p.razorpayPaymentId!, status: p.status }));

    const report = await deps.prisma.reconciliationReport.upsert({
      where: { forDate: startOfDay },
      update: {
        ourCount: ours.length,
        razorpayCount: rzpPayments.length,
        matchedCount: matched,
        missingInOurs,
        missingInRzp,
        mismatches,
      },
      create: {
        id: uuidv7(),
        forDate: startOfDay,
        ourCount: ours.length,
        razorpayCount: rzpPayments.length,
        matchedCount: matched,
        missingInOurs,
        missingInRzp,
        mismatches,
      },
    });

    if (mismatches.length || missingInOurs.length || missingInRzp.length) {
      deps.logger.warn(
        {
          date: startOfDay.toISOString().slice(0, 10),
          mismatches: mismatches.length,
          missingInOurs: missingInOurs.length,
          missingInRzp: missingInRzp.length,
        },
        "reconciliation_mismatch",
      );
    } else {
      deps.logger.info({ matched }, "reconciliation_clean");
    }
    return { id: report.id, mismatches: mismatches.length + missingInOurs.length + missingInRzp.length };
  }

  function scheduleNext(): void {
    if (stopped) return;
    timer = setTimeout(async () => {
      if (inflight) return scheduleNext();
      inflight = true;
      try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await runForDate(yesterday);
      } catch (err) {
        deps.logger.error({ err }, "reconciliation_tick_failed");
      } finally {
        inflight = false;
      }
      scheduleNext();
    }, intervalMs);
    timer.unref();
  }

  return {
    runForDate,
    start() {
      stopped = false;
      scheduleNext();
      deps.logger.info({ intervalMs }, "reconciliation_worker_started");
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      while (inflight) await new Promise((r) => setTimeout(r, 50));
    },
  };
}
