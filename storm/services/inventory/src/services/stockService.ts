import { uuidv7 } from "uuidv7";
import { StormError, ErrorCodes, InventoryEventTypes } from "@storm/contracts";
import type {
  StockDetail,
  StockItem as StockItemDto,
  StockListQuery,
} from "@storm/contracts";

import type { PrismaClient, StockItem } from "../db.js";
import { appendOutbox } from "../outbox/writer.js";

export interface UpsertStockInput {
  sku: string;
  productId: string;
  productName?: string;
  initialQuantity?: number;
  lowStockThreshold?: number;
}

export interface AdjustInput {
  sku: string;
  delta: number;
  reason: string;
  lowStockThreshold?: number;
}

export interface StockListResult {
  data: StockItemDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function stockService(prisma: PrismaClient) {
  async function ensureForSku(input: UpsertStockInput) {
    const existing = await prisma.stockItem.findUnique({ where: { sku: input.sku } });
    if (existing) return existing;
    return prisma.stockItem.create({
      data: {
        sku: input.sku,
        productId: input.productId,
        productName: input.productName ?? "",
        quantityOnHand: input.initialQuantity ?? 0,
        lowStockThreshold: input.lowStockThreshold ?? 5,
      },
    });
  }

  async function adjust(input: AdjustInput): Promise<StockItemDto> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.stockItem.findUnique({ where: { sku: input.sku } });
      if (!existing) {
        throw new StormError({
          code: ErrorCodes.SKU_NOT_FOUND,
          message: `SKU ${input.sku} not found.`,
          status: 404,
        });
      }
      const newOnHand = existing.quantityOnHand + input.delta;
      if (newOnHand < existing.quantityReserved) {
        throw new StormError({
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Adjustment would push onHand below currently reserved quantity.",
          status: 422,
        });
      }
      if (newOnHand < 0) {
        throw new StormError({
          code: ErrorCodes.VALIDATION_FAILED,
          message: "On-hand quantity cannot be negative.",
          status: 422,
        });
      }
      const updateData: Record<string, unknown> = {
        quantityOnHand: { increment: input.delta },
        version: { increment: 1 },
      };
      if (input.lowStockThreshold !== undefined) {
        updateData.lowStockThreshold = input.lowStockThreshold;
      }
      const updated = await tx.stockItem.update({
        where: { sku: input.sku },
        data: updateData,
      });
      await tx.stockMovement.create({
        data: {
          id: uuidv7(),
          sku: input.sku,
          delta: input.delta,
          reason: input.reason,
        },
      });
      await appendOutbox(tx, {
        aggregateId: input.sku,
        eventType: InventoryEventTypes.StockChanged,
        payload: {
          sku: input.sku,
          productId: updated.productId,
          quantityOnHand: updated.quantityOnHand,
          quantityReserved: updated.quantityReserved,
          reason: input.reason,
        },
      });
      if (updated.quantityOnHand - updated.quantityReserved <= updated.lowStockThreshold) {
        await appendOutbox(tx, {
          aggregateId: input.sku,
          eventType: InventoryEventTypes.LowStock,
          payload: {
            sku: input.sku,
            productId: updated.productId,
            quantityOnHand: updated.quantityOnHand,
            threshold: updated.lowStockThreshold,
          },
        });
      }
      return toDto(updated);
    });
  }

  async function list(query: StockListQuery): Promise<StockListResult> {
    const where: Record<string, unknown> = {};
    if (query.sku) where.sku = query.sku;
    if (query.productId) where.productId = query.productId;
    if (query.q) where.productName = { contains: query.q, mode: "insensitive" };

    const take = query.limit + 1;
    const cursor = query.cursor ? { sku: query.cursor } : undefined;
    const rows = await prisma.stockItem.findMany({
      where,
      orderBy: { sku: "asc" },
      take,
      ...(cursor ? { cursor, skip: 1 } : {}),
    });
    const hasMore = rows.length > query.limit;
    const items = (hasMore ? rows.slice(0, -1) : rows).filter((r) => {
      if (query.lowStockOnly !== true) return true;
      return r.quantityOnHand - r.quantityReserved <= r.lowStockThreshold;
    });
    const last = items[items.length - 1];
    return {
      data: items.map(toDto),
      nextCursor: hasMore && last ? last.sku : null,
      hasMore,
    };
  }

  async function detail(sku: string): Promise<StockDetail> {
    const item = await prisma.stockItem.findUnique({ where: { sku } });
    if (!item) {
      throw new StormError({
        code: ErrorCodes.SKU_NOT_FOUND,
        message: `SKU ${sku} not found.`,
        status: 404,
      });
    }
    const [movements, reservations] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { sku },
        orderBy: { occurredAt: "desc" },
        take: 50,
      }),
      prisma.reservation.findMany({
        where: { sku, status: "active" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
    return {
      ...toDto(item),
      movements: movements.map((m) => ({
        id: m.id,
        sku: m.sku,
        delta: m.delta,
        reason: m.reason,
        reservationId: m.reservationId,
        occurredAt: m.occurredAt.toISOString(),
      })),
      reservations: reservations.map((r) => ({
        id: r.id,
        sku: r.sku,
        qty: r.qty,
        orderId: r.orderId,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        expiresAt: r.expiresAt.toISOString(),
      })),
    };
  }

  async function lowStockAlerts(): Promise<StockItemDto[]> {
    const rows = await prisma.$queryRaw<StockItem[]>`
      SELECT * FROM stock_items
      WHERE (quantity_on_hand - quantity_reserved) <= low_stock_threshold
      ORDER BY (quantity_on_hand - quantity_reserved) ASC
      LIMIT 200
    `;
    return rows.map(toDto);
  }

  async function getStock(skus: string[]): Promise<StockItemDto[]> {
    if (skus.length === 0) return [];
    const rows = await prisma.stockItem.findMany({ where: { sku: { in: skus } } });
    return rows.map(toDto);
  }

  return { ensureForSku, adjust, list, detail, lowStockAlerts, getStock };
}

function toDto(s: StockItem): StockItemDto {
  const available = s.quantityOnHand - s.quantityReserved;
  return {
    sku: s.sku,
    productId: s.productId,
    productName: s.productName,
    quantityOnHand: s.quantityOnHand,
    quantityReserved: s.quantityReserved,
    quantityAvailable: Math.max(0, available),
    lowStockThreshold: s.lowStockThreshold,
    belowThreshold: available <= s.lowStockThreshold,
    updatedAt: s.updatedAt.toISOString(),
  };
}

export type StockService = ReturnType<typeof stockService>;
