import { uuidv7 } from "uuidv7";
import {
  StormError,
  ErrorCodes,
  OrderEventTypes,
  type OrderCancelled,
  type OrderCreated,
  type OrderFailed,
  type OrderConfirmed,
  type OrderStatusChanged,
} from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";
import type { Order, OrderItem, OrderStatus, PrismaClient } from "../db.js";
import { appendOutbox } from "../outbox/writer.js";
import type { CartClient } from "./cartClient.js";
import type { IdentityClient } from "./identityClient.js";
import type { IdempotencyCache } from "./idempotencyCache.js";
import type { InventoryClient } from "./inventoryClient.js";
import type { PaymentClient } from "./paymentClient.js";
import type { OrderRepo } from "../repositories/orderRepo.js";
import { calculateShippingPaise } from "./shipping.js";

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  paymentMethod: "razorpay";
  idempotencyKey: string;
}

export interface CreateOrderResult {
  order: Order & { items: OrderItem[] };
  razorpayKeyId: string;
}

export interface OrderService {
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  getForUser(orderId: string, userId: string): Promise<Order & { items: OrderItem[] }>;
  cancel(input: {
    orderId: string;
    actor: { kind: "user" | "admin" | "system"; id: string };
    reason?: string;
  }): Promise<Order & { items: OrderItem[] }>;
  transitionStatus(input: {
    orderId: string;
    toStatus: OrderStatus;
    adminUserId: string;
    reason?: string;
  }): Promise<Order & { items: OrderItem[] }>;
  handlePaymentCaptured(input: {
    razorpayOrderId: string;
    paidAt: Date;
  }): Promise<void>;
  handlePaymentFailed(input: { razorpayOrderId: string; reason: string }): Promise<void>;
  expireStalePending(): Promise<number>;
}

const ADMIN_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: [],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  failed: [],
};

export function adminTransitionsFor(status: OrderStatus): OrderStatus[] {
  return ADMIN_TRANSITIONS[status] ?? [];
}

function isAllowedAdminTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ADMIN_TRANSITIONS[from]?.includes(to) ?? false;
}

export function orderService(deps: {
  prisma: PrismaClient;
  repo: OrderRepo;
  cart: CartClient;
  identity: IdentityClient;
  inventory: InventoryClient;
  payments: PaymentClient;
  idempotency: IdempotencyCache;
  config: Config;
  logger: Logger;
}): OrderService {
  const { prisma, repo, cart, identity, inventory, payments, idempotency, config, logger } = deps;

  async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    // Step 1 — idempotency replay
    const cached = await idempotency.get(input.userId, input.idempotencyKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { orderId: string; razorpayKeyId: string };
      const order = await repo.findForUser(parsed.orderId, input.userId);
      if (order) {
        return { order, razorpayKeyId: parsed.razorpayKeyId };
      }
    }
    const dbReplay = await repo.findByUserAndIdempotencyKey(input.userId, input.idempotencyKey);
    if (dbReplay && dbReplay.razorpayOrderId) {
      // Surface a usable response even if the redis cache vanished.
      return { order: dbReplay, razorpayKeyId: "" };
    }

    // Step 2 — read cart + address
    const [cartSnapshot, address, profile] = await Promise.all([
      cart.getCart(input.userId),
      identity.getAddress(input.userId, input.addressId),
      identity.getProfile(input.userId),
    ]);
    if (!cartSnapshot.items.length) {
      throw new StormError({
        code: ErrorCodes.CART_EMPTY,
        message: "Cart is empty.",
        status: 422,
      });
    }
    if (!address) {
      throw new StormError({
        code: ErrorCodes.ADDRESS_NOT_OWNED,
        message: "Address not found or not owned by user.",
        status: 422,
      });
    }
    if (!profile) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "User profile not found.",
        status: 422,
      });
    }
    const outOfStock = cartSnapshot.items.filter((i) => !i.available);
    if (outOfStock.length) {
      throw new StormError({
        code: ErrorCodes.INSUFFICIENT_STOCK,
        message: "One or more items are out of stock.",
        status: 409,
        details: { skus: outOfStock.map((i) => i.sku) },
      });
    }

    // Step 3 — compute totals
    const subtotalPaise = cartSnapshot.items.reduce(
      (sum, i) => sum + i.currentPrice * i.qty,
      0,
    );
    const shippingFeePaise = calculateShippingPaise(subtotalPaise, config);
    const totalAmountPaise = subtotalPaise + shippingFeePaise;
    const itemsCount = cartSnapshot.items.reduce((sum, i) => sum + i.qty, 0);

    const orderId = uuidv7();

    // Step 4 — reserve inventory
    const reservation = await inventory.reserve({
      items: cartSnapshot.items.map((i) => ({ sku: i.sku, qty: i.qty })),
      orderId,
      ttlSeconds: config.reservationTtlSec,
    });
    if (!reservation.ok) {
      throw new StormError({
        code: ErrorCodes.INSUFFICIENT_STOCK,
        message: "One or more items have insufficient stock.",
        status: 409,
        details: { rejections: reservation.rejections },
      });
    }

    // Step 5 — create Razorpay order via payment-service
    let paymentResp;
    try {
      paymentResp = await payments.createPayment({
        orderId,
        amountPaise: totalAmountPaise,
        currency: "INR",
      });
    } catch (err) {
      await inventory.release(reservation.reservationId, "payment_create_failed").catch((rErr) => {
        logger.error({ rErr }, "compensating_release_failed");
      });
      throw err;
    }

    // Step 6 — persist order + outbox in single tx
    const addressSnapshot = {
      addressId: address.id,
      label: address.label,
      fullName: address.fullName,
      phone: address.mobile,
      line1: address.line1,
      line2: address.line2 ?? null,
      landmark: address.landmark ?? null,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    };

    let created: { order: Order; items: OrderItem[] };
    try {
      created = await prisma.$transaction(async (tx) => {
        const result = await deps.repo.createWithItems(tx, {
          id: orderId,
          userId: input.userId,
          status: "pending_payment",
          itemsCount,
          subtotalPaise,
          shippingFeePaise,
          totalAmountPaise,
          currency: "INR",
          addressSnapshot: addressSnapshot as unknown as Record<string, unknown>,
          razorpayOrderId: paymentResp.razorpayOrderId,
          reservationId: reservation.reservationId,
          reservationExpiresAt: reservation.expiresAt,
          idempotencyKey: input.idempotencyKey,
          customerEmail: profile.email,
          customerName: profile.name,
          items: cartSnapshot.items.map((i) => ({
            sku: i.sku,
            productId: i.productId,
            variantId: i.variantId ?? null,
            name: i.name,
            image: i.primaryImageUrl ? { url: i.primaryImageUrl } : null,
            unitPricePaise: i.currentPrice,
            qty: i.qty,
            lineTotalPaise: i.currentPrice * i.qty,
          })),
        });
        await repo.recordTransition(tx, {
          orderId,
          fromStatus: null,
          toStatus: "pending_payment",
          changedBy: "system",
          reason: "order_created",
        });
        const createdPayload: OrderCreated = {
          orderId,
          userId: input.userId,
          reservationId: reservation.reservationId,
          razorpayOrderId: paymentResp.razorpayOrderId,
          items: cartSnapshot.items.map((i) => ({
            sku: i.sku,
            productId: i.productId,
            qty: i.qty,
            pricePaise: i.currentPrice,
          })),
          subtotalPaise,
          shippingFeePaise,
          totalPaise: totalAmountPaise,
          currency: "INR",
          address: {
            fullName: address.fullName,
            phone: address.mobile,
            line1: address.line1,
            line2: address.line2 ?? null,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
          },
          createdAt: new Date().toISOString(),
        };
        await appendOutbox(tx, {
          aggregateId: orderId,
          eventType: OrderEventTypes.Created,
          payload: createdPayload as unknown as Record<string, unknown>,
        });
        return result;
      });
    } catch (err) {
      await inventory.release(reservation.reservationId, "persist_failed").catch((rErr) => {
        logger.error({ rErr }, "compensating_release_failed");
      });
      throw err;
    }

    // Step 7 — idempotency cache
    await idempotency
      .set(
        input.userId,
        input.idempotencyKey,
        JSON.stringify({ orderId, razorpayKeyId: paymentResp.razorpayKeyId }),
      )
      .catch((err: unknown) => logger.warn({ err }, "idempotency_cache_failed"));

    return {
      order: { ...created.order, items: created.items },
      razorpayKeyId: paymentResp.razorpayKeyId,
    };
  }

  async function getForUser(orderId: string, userId: string) {
    const order = await repo.findForUser(orderId, userId);
    if (!order) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Order not found.",
        status: 404,
      });
    }
    return order;
  }

  async function cancel(input: {
    orderId: string;
    actor: { kind: "user" | "admin" | "system"; id: string };
    reason?: string;
  }) {
    const order = await repo.findById(input.orderId);
    if (!order) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Order not found.",
        status: 404,
      });
    }
    if (input.actor.kind === "user" && order.userId !== input.actor.id) {
      throw new StormError({
        code: ErrorCodes.ORDER_NOT_OWNED,
        message: "Order does not belong to this user.",
        status: 403,
      });
    }
    if (!isCancellable(order.status, input.actor.kind)) {
      throw new StormError({
        code: ErrorCodes.ORDER_NOT_CANCELLABLE,
        message: `Order in status ${order.status} cannot be cancelled.`,
        status: 409,
      });
    }
    const cancelledAt = new Date();
    const addressPhone = (order.addressSnapshot as { phone?: string } | null)?.phone;
    const updated = await prisma.$transaction(async (tx) => {
      const next = await repo.applyTransition(tx, {
        orderId: order.id,
        toStatus: "cancelled",
      });
      await repo.recordTransition(tx, {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "cancelled",
        changedBy: input.actor.kind === "system" ? "system" : input.actor.id,
        reason: input.reason ?? "cancelled",
      });
      const payload: OrderCancelled = {
        orderId: order.id,
        userId: order.userId,
        cancelledBy: input.actor.kind,
        cancelledAt: cancelledAt.toISOString(),
        ...(input.reason ? { reason: input.reason } : {}),
        ...(order.customerEmail ? { customerEmail: order.customerEmail } : {}),
        ...(order.customerName ? { customerName: order.customerName } : {}),
        ...(addressPhone ? { phone: addressPhone } : {}),
      };
      await appendOutbox(tx, {
        aggregateId: order.id,
        eventType: OrderEventTypes.Cancelled,
        payload: payload as unknown as Record<string, unknown>,
      });
      return next;
    });
    return repo.findById(updated.id).then((o) => o!);
  }

  async function transitionStatus(input: {
    orderId: string;
    toStatus: OrderStatus;
    adminUserId: string;
    reason?: string;
  }) {
    if (input.toStatus === "cancelled") {
      return cancel({
        orderId: input.orderId,
        actor: { kind: "admin", id: input.adminUserId },
        ...(input.reason ? { reason: input.reason } : {}),
      });
    }
    const order = await repo.findById(input.orderId);
    if (!order) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Order not found.",
        status: 404,
      });
    }
    if (!isAllowedAdminTransition(order.status, input.toStatus)) {
      throw new StormError({
        code: ErrorCodes.INVALID_STATE_TRANSITION,
        message: `Cannot transition ${order.status} → ${input.toStatus}.`,
        status: 422,
      });
    }
    const changedAt = new Date();
    const addressPhone = (order.addressSnapshot as { phone?: string } | null)?.phone;
    await prisma.$transaction(async (tx) => {
      await repo.applyTransition(tx, {
        orderId: order.id,
        toStatus: input.toStatus,
      });
      await repo.recordTransition(tx, {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: input.toStatus,
        changedBy: input.adminUserId,
        reason: input.reason ?? "admin_transition",
      });
      const payload: OrderStatusChanged = {
        orderId: order.id,
        userId: order.userId,
        fromStatus: order.status,
        toStatus: input.toStatus,
        changedAt: changedAt.toISOString(),
        changedBy: input.adminUserId,
        ...(input.reason ? { reason: input.reason } : {}),
        ...(order.customerEmail ? { customerEmail: order.customerEmail } : {}),
        ...(order.customerName ? { customerName: order.customerName } : {}),
        ...(addressPhone ? { phone: addressPhone } : {}),
      };
      await appendOutbox(tx, {
        aggregateId: order.id,
        eventType: OrderEventTypes.StatusChanged,
        payload: payload as unknown as Record<string, unknown>,
      });
    });
    const full = await repo.findById(order.id);
    return full!;
  }

  async function handlePaymentCaptured(input: { razorpayOrderId: string; paidAt: Date }) {
    const order = await repo.findByRazorpayOrderId(input.razorpayOrderId);
    if (!order) {
      logger.warn({ razorpayOrderId: input.razorpayOrderId }, "captured_but_no_order");
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Order not found for razorpayOrderId.",
        status: 404,
      });
    }
    if (order.status !== "pending_payment") {
      logger.info({ orderId: order.id, status: order.status }, "captured_for_non_pending_order");
      return;
    }
    await prisma.$transaction(async (tx) => {
      await repo.applyTransition(tx, {
        orderId: order.id,
        toStatus: "confirmed",
        confirmedAt: input.paidAt,
      });
      await repo.recordTransition(tx, {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "confirmed",
        changedBy: "system",
        reason: "payment_captured",
      });
      const payload: OrderConfirmed = {
        orderId: order.id,
        userId: order.userId,
        reservationId: order.reservationId,
        items: order.items.map((it) => ({
          sku: it.sku,
          productId: it.productId,
          qty: it.qty,
          pricePaise: it.unitPricePaise,
        })),
        subtotalPaise: order.subtotalPaise,
        shippingFeePaise: order.shippingFeePaise,
        totalPaise: order.totalAmountPaise,
        currency: "INR",
        address: order.addressSnapshot as OrderConfirmed["address"],
        paidAt: input.paidAt.toISOString(),
        customerEmail: order.customerEmail,
        customerName: order.customerName,
      };
      await appendOutbox(tx, {
        aggregateId: order.id,
        eventType: OrderEventTypes.Confirmed,
        payload: payload as unknown as Record<string, unknown>,
      });
    });
  }

  async function handlePaymentFailed(input: { razorpayOrderId: string; reason: string }) {
    const order = await repo.findByRazorpayOrderId(input.razorpayOrderId);
    if (!order) {
      logger.warn({ razorpayOrderId: input.razorpayOrderId }, "failed_but_no_order");
      return;
    }
    if (order.status !== "pending_payment") {
      logger.info({ orderId: order.id, status: order.status }, "failed_for_non_pending_order");
      return;
    }
    await transitionToFailed(order.id, order.status, order.userId, order.reservationId, input.reason, "payment_failed");
  }

  async function expireStalePending(): Promise<number> {
    const stale = await repo.expirePending(new Date());
    let n = 0;
    for (const order of stale) {
      try {
        await transitionToFailed(order.id, order.status, order.userId, order.reservationId, "reservation_ttl_expired", "ttl_sweep");
        n += 1;
      } catch (err) {
        logger.error({ err, orderId: order.id }, "ttl_sweep_transition_failed");
      }
    }
    if (n > 0) logger.info({ count: n }, "ttl_sweep_expired_orders");
    return n;
  }

  async function transitionToFailed(
    orderId: string,
    fromStatus: OrderStatus,
    userId: string,
    reservationId: string | null,
    reason: string,
    changedBy: string,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await repo.applyTransition(tx, { orderId, toStatus: "failed" });
      await repo.recordTransition(tx, {
        orderId,
        fromStatus,
        toStatus: "failed",
        changedBy,
        reason,
      });
      const payload: OrderFailed = {
        orderId,
        userId,
        reservationId,
        reason,
      };
      await appendOutbox(tx, {
        aggregateId: orderId,
        eventType: OrderEventTypes.Failed,
        payload: payload as unknown as Record<string, unknown>,
      });
    });
  }

  return {
    createOrder,
    getForUser,
    cancel,
    transitionStatus,
    handlePaymentCaptured,
    handlePaymentFailed,
    expireStalePending,
  };
}

function isCancellable(status: OrderStatus, actorKind: "user" | "admin" | "system"): boolean {
  if (status === "pending_payment") return true;
  if (status === "confirmed") return true;
  if (status === "processing") return actorKind !== "user";
  return false;
}
