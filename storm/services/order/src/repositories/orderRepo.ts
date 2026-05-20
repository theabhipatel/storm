import { uuidv7 } from "uuidv7";

import { Prisma } from "../db.js";
import type {
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusHistory,
  PrismaClient,
} from "../db.js";

export interface CreateOrderItemInput {
  sku: string;
  productId: string;
  variantId: string | null;
  name: string;
  image: Record<string, unknown> | null;
  unitPricePaise: number;
  qty: number;
  lineTotalPaise: number;
}

export interface CreateOrderInput {
  id: string;
  userId: string;
  status: OrderStatus;
  itemsCount: number;
  subtotalPaise: number;
  shippingFeePaise: number;
  totalAmountPaise: number;
  currency: string;
  addressSnapshot: Record<string, unknown>;
  razorpayOrderId: string;
  reservationId: string | null;
  reservationExpiresAt: Date | null;
  idempotencyKey: string;
  customerEmail: string;
  customerName: string;
  items: CreateOrderItemInput[];
}

export interface OrderRepo {
  createWithItems(
    tx: Prisma.TransactionClient,
    input: CreateOrderInput,
  ): Promise<{ order: Order; items: OrderItem[] }>;
  findById(id: string): Promise<(Order & { items: OrderItem[] }) | null>;
  findForUser(id: string, userId: string): Promise<(Order & { items: OrderItem[] }) | null>;
  findByUserAndIdempotencyKey(
    userId: string,
    key: string,
  ): Promise<(Order & { items: OrderItem[] }) | null>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<(Order & { items: OrderItem[] }) | null>;
  listForUser(input: {
    userId: string;
    cursor?: string;
    limit: number;
  }): Promise<{ items: (Order & { items: OrderItem[] })[]; nextCursor: string | null }>;
  listForAdmin(input: {
    status?: OrderStatus;
    q?: string;
    customerId?: string;
    from?: Date;
    to?: Date;
    cursor?: string;
    limit: number;
  }): Promise<{ items: (Order & { items: OrderItem[] })[]; nextCursor: string | null }>;
  adminMetrics(input: {
    from?: Date;
    to?: Date;
  }): Promise<{
    count: number;
    revenuePaise: number;
    aovPaise: number;
    cancelledCount: number;
    currency: string;
  }>;
  history(orderId: string): Promise<OrderStatusHistory[]>;
  recordTransition(
    tx: Prisma.TransactionClient,
    input: {
      orderId: string;
      fromStatus: OrderStatus | null;
      toStatus: OrderStatus;
      changedBy: string;
      reason?: string | null;
    },
  ): Promise<void>;
  applyTransition(
    tx: Prisma.TransactionClient,
    input: {
      orderId: string;
      toStatus: OrderStatus;
      confirmedAt?: Date;
    },
  ): Promise<Order>;
  expirePending(now: Date): Promise<Order[]>;
}

export function orderRepo(prisma: PrismaClient): OrderRepo {
  return {
    async createWithItems(tx, input) {
      const order = await tx.order.create({
        data: {
          id: input.id,
          userId: input.userId,
          status: input.status,
          itemsCount: input.itemsCount,
          subtotalPaise: input.subtotalPaise,
          shippingFeePaise: input.shippingFeePaise,
          totalAmountPaise: input.totalAmountPaise,
          currency: input.currency,
          addressSnapshot: input.addressSnapshot as Prisma.InputJsonValue,
          razorpayOrderId: input.razorpayOrderId,
          reservationId: input.reservationId,
          reservationExpiresAt: input.reservationExpiresAt,
          idempotencyKey: input.idempotencyKey,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
        },
      });
      const items: OrderItem[] = [];
      for (const it of input.items) {
        const row = await tx.orderItem.create({
          data: {
            id: uuidv7(),
            orderId: order.id,
            sku: it.sku,
            productId: it.productId,
            variantId: it.variantId,
            name: it.name,
            image: (it.image ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            unitPricePaise: it.unitPricePaise,
            qty: it.qty,
            lineTotalPaise: it.lineTotalPaise,
          },
        });
        items.push(row);
      }
      return { order, items };
    },

    async findById(id) {
      return prisma.order.findUnique({ where: { id }, include: { items: true } });
    },

    async findForUser(id, userId) {
      return prisma.order.findFirst({ where: { id, userId }, include: { items: true } });
    },

    async findByUserAndIdempotencyKey(userId, key) {
      return prisma.order.findFirst({
        where: { userId, idempotencyKey: key },
        include: { items: true },
      });
    },

    async findByRazorpayOrderId(razorpayOrderId) {
      return prisma.order.findFirst({
        where: { razorpayOrderId },
        include: { items: true },
      });
    },

    async listForUser({ userId, cursor, limit }) {
      const rows = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { items: true },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      const items = rows.slice(0, limit);
      const nextCursor = rows.length > limit ? items[items.length - 1]!.id : null;
      return { items, nextCursor };
    },

    async listForAdmin({ status, q, customerId, from, to, cursor, limit }) {
      const where: Prisma.OrderWhereInput = {};
      if (status) where.status = status;
      if (customerId) where.userId = customerId;
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = from;
        if (to) where.createdAt.lte = to;
      }
      if (q) {
        where.OR = [
          { id: { equals: q } },
          { customerEmail: { contains: q, mode: "insensitive" } },
          { razorpayOrderId: { contains: q } },
        ];
      }
      const rows = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { items: true },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      const items = rows.slice(0, limit);
      const nextCursor = rows.length > limit ? items[items.length - 1]!.id : null;
      return { items, nextCursor };
    },

    async adminMetrics({ from, to }) {
      const where: Prisma.OrderWhereInput = {};
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = from;
        if (to) where.createdAt.lte = to;
      }
      const completedStatuses: OrderStatus[] = [
        "confirmed",
        "processing",
        "shipped",
        "delivered",
      ];

      const [agg, cancelledCount] = await Promise.all([
        prisma.order.aggregate({
          where: { ...where, status: { in: completedStatuses } },
          _count: { _all: true },
          _sum: { totalAmountPaise: true },
        }),
        prisma.order.count({
          where: { ...where, status: "cancelled" },
        }),
      ]);

      const count = agg._count._all;
      const revenuePaise = agg._sum.totalAmountPaise ?? 0;
      const aovPaise = count > 0 ? Math.round(revenuePaise / count) : 0;
      return {
        count,
        revenuePaise,
        aovPaise,
        cancelledCount,
        currency: "INR",
      };
    },

    async history(orderId) {
      return prisma.orderStatusHistory.findMany({
        where: { orderId },
        orderBy: { changedAt: "asc" },
      });
    },

    async recordTransition(tx, input) {
      await tx.orderStatusHistory.create({
        data: {
          id: uuidv7(),
          orderId: input.orderId,
          fromStatus: input.fromStatus,
          toStatus: input.toStatus,
          changedBy: input.changedBy,
          reason: input.reason ?? null,
        },
      });
    },

    async applyTransition(tx, input) {
      const data: Prisma.OrderUpdateInput = { status: input.toStatus };
      if (input.confirmedAt) data.confirmedAt = input.confirmedAt;
      return tx.order.update({ where: { id: input.orderId }, data });
    },

    async expirePending(now) {
      const rows = await prisma.order.findMany({
        where: {
          status: "pending_payment",
          reservationExpiresAt: { not: null, lte: now },
        },
        take: 100,
      });
      return rows;
    },
  };
}
