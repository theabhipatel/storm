import { uuidv7 } from "uuidv7";
import { StormError, ErrorCodes, InventoryEventTypes } from "@storm/contracts";
import type { Logger } from "@storm/logger";

import { Prisma } from "../db.js";
import type { PrismaClient } from "../db.js";
import { appendOutbox } from "../outbox/writer.js";

export interface ReserveItem {
  sku: string;
  qty: number;
}

export interface ReservationRejection {
  sku: string;
  requested: number;
  available: number;
}

export interface ReserveSuccess {
  ok: true;
  reservationId: string;
  expiresAt: Date;
}

export interface ReserveFailure {
  ok: false;
  rejections: ReservationRejection[];
}

export type ReserveResult = ReserveSuccess | ReserveFailure;

export interface ReservationService {
  reserve(input: {
    items: ReserveItem[];
    orderId: string;
    ttlSeconds: number;
  }): Promise<ReserveResult>;
  confirm(reservationId: string): Promise<void>;
  release(reservationId: string, reason: ReleaseReason): Promise<void>;
  restock(orderId: string, reason: string): Promise<void>;
}

export type ReleaseReason = "expired" | "order_failed" | "order_cancelled" | "manual";

export function reservationService(deps: {
  prisma: PrismaClient;
  logger: Logger;
}): ReservationService {
  const { prisma, logger } = deps;

  async function reserve(input: {
    items: ReserveItem[];
    orderId: string;
    ttlSeconds: number;
  }): Promise<ReserveResult> {
    if (input.items.length === 0) {
      throw new StormError({
        code: ErrorCodes.VALIDATION_FAILED,
        message: "Reservation requires at least one item.",
        status: 422,
      });
    }
    // Stable sku order avoids deadlocks when two reservations contend on the same skus.
    const items = [...input.items].sort((a, b) => a.sku.localeCompare(b.sku));
    const expiresAt = new Date(Date.now() + input.ttlSeconds * 1000);

    return prisma.$transaction(async (tx) => {
      // Pessimistic lock per sku in fixed order to prevent oversell.
      const lockedRows = await tx.$queryRaw<
        { sku: string; quantity_on_hand: number; quantity_reserved: number; product_id: string }[]
      >`
        SELECT sku, quantity_on_hand, quantity_reserved, product_id
        FROM stock_items
        WHERE sku IN (${Prisma.join(items.map((i) => i.sku))})
        ORDER BY sku
        FOR UPDATE
      `;
      const bySku = new Map(lockedRows.map((r) => [r.sku, r]));
      const rejections: ReservationRejection[] = [];
      for (const item of items) {
        const row = bySku.get(item.sku);
        const available = row ? row.quantity_on_hand - row.quantity_reserved : 0;
        if (!row || available < item.qty) {
          rejections.push({ sku: item.sku, requested: item.qty, available: Math.max(0, available) });
        }
      }
      if (rejections.length > 0) {
        return { ok: false, rejections };
      }

      const reservationId = uuidv7();
      // Bump reserved counts + version per sku.
      for (const item of items) {
        await tx.stockItem.update({
          where: { sku: item.sku },
          data: {
            quantityReserved: { increment: item.qty },
            version: { increment: 1 },
          },
        });
        await tx.reservation.create({
          data: {
            id: uuidv7(),
            sku: item.sku,
            qty: item.qty,
            orderId: input.orderId,
            status: "active",
            expiresAt,
          },
        });
      }
      // Single rollup reservation id (return one id to caller; per-sku rows already created).
      // For simplicity we re-use the first inserted row id by querying.
      const first = await tx.reservation.findFirst({
        where: { orderId: input.orderId, status: "active" },
        orderBy: { createdAt: "asc" },
      });
      const headId = first?.id ?? reservationId;

      await appendOutbox(tx, {
        aggregateId: input.orderId,
        eventType: InventoryEventTypes.Reserved,
        payload: {
          reservationId: headId,
          orderId: input.orderId,
          expiresAt: expiresAt.toISOString(),
          items: items.map((i) => ({ sku: i.sku, qty: i.qty })),
        },
      });

      return { ok: true, reservationId: headId, expiresAt };
    });
  }

  // Reservations are created as one row per sku under the same orderId.
  // `reservationId` from Reserve() is the head row id; to confirm/release we
  // act on all rows for that order that are still active.
  async function confirm(reservationId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const head = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!head) {
        throw new StormError({
          code: ErrorCodes.RESERVATION_NOT_FOUND,
          message: "Reservation not found.",
          status: 404,
        });
      }
      const rows = await tx.reservation.findMany({
        where: { orderId: head.orderId, status: "active" },
        orderBy: { sku: "asc" },
      });
      if (rows.length === 0) {
        throw new StormError({
          code: ErrorCodes.RESERVATION_NOT_ACTIVE,
          message: "No active reservation rows to confirm.",
          status: 409,
        });
      }
      for (const r of rows) {
        const updated = await tx.stockItem.update({
          where: { sku: r.sku },
          data: {
            quantityOnHand: { decrement: r.qty },
            quantityReserved: { decrement: r.qty },
            version: { increment: 1 },
          },
        });
        await tx.stockMovement.create({
          data: {
            id: uuidv7(),
            sku: r.sku,
            delta: -r.qty,
            reason: "order_confirmed",
            reservationId: r.id,
          },
        });
        await tx.reservation.update({
          where: { id: r.id },
          data: { status: "confirmed" },
        });
        await appendOutbox(tx, {
          aggregateId: r.sku,
          eventType: InventoryEventTypes.StockChanged,
          payload: {
            sku: r.sku,
            productId: updated.productId,
            quantityOnHand: updated.quantityOnHand,
            quantityReserved: updated.quantityReserved,
            reason: "order_confirmed",
          },
        });
      }
      logger.info({ reservationId, orderId: head.orderId, rows: rows.length }, "reservation_confirmed");
    });
  }

  async function release(reservationId: string, reason: ReleaseReason): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const head = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!head) {
        throw new StormError({
          code: ErrorCodes.RESERVATION_NOT_FOUND,
          message: "Reservation not found.",
          status: 404,
        });
      }
      const rows = await tx.reservation.findMany({
        where: { orderId: head.orderId, status: "active" },
        orderBy: { sku: "asc" },
      });
      if (rows.length === 0) return;
      for (const r of rows) {
        await tx.stockItem.update({
          where: { sku: r.sku },
          data: {
            quantityReserved: { decrement: r.qty },
            version: { increment: 1 },
          },
        });
        await tx.reservation.update({
          where: { id: r.id },
          data: { status: "released" },
        });
      }
      await appendOutbox(tx, {
        aggregateId: head.orderId,
        eventType: InventoryEventTypes.Released,
        payload: { reservationId, reason },
      });
      logger.info({ reservationId, orderId: head.orderId, reason }, "reservation_released");
    });
  }

  async function restock(orderId: string, reason: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const rows = await tx.reservation.findMany({
        where: { orderId, status: "confirmed" },
        orderBy: { sku: "asc" },
      });
      if (rows.length === 0) return;
      for (const r of rows) {
        const updated = await tx.stockItem.update({
          where: { sku: r.sku },
          data: {
            quantityOnHand: { increment: r.qty },
            version: { increment: 1 },
          },
        });
        await tx.stockMovement.create({
          data: {
            id: uuidv7(),
            sku: r.sku,
            delta: r.qty,
            reason: `restock:${reason}`,
            reservationId: r.id,
          },
        });
        await appendOutbox(tx, {
          aggregateId: r.sku,
          eventType: InventoryEventTypes.StockChanged,
          payload: {
            sku: r.sku,
            productId: updated.productId,
            quantityOnHand: updated.quantityOnHand,
            quantityReserved: updated.quantityReserved,
            reason: `restock:${reason}`,
          },
        });
      }
      logger.info({ orderId, rows: rows.length }, "order_restocked");
    });
  }

  return { reserve, confirm, release, restock };
}
