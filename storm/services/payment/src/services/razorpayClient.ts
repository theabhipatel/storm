import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createRequire } from "node:module";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";

export interface CreateOrderInput {
  amountPaise: number;
  currency: "INR";
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
}

export interface RazorpayPayment {
  id: string;
  orderId: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string;
  capturedAt: number | null;
  failureReason: string | null;
}

export interface RazorpayClient {
  createOrder(input: CreateOrderInput): Promise<RazorpayOrder>;
  fetchPayment(razorpayPaymentId: string): Promise<RazorpayPayment | null>;
  listPaymentsForDay(date: Date): Promise<RazorpayPayment[]>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  keyId: string;
  isStub: boolean;
}

interface RazorpaySdkOrder {
  id: string;
  amount: number | string;
  currency: string;
  receipt?: string | null;
  status: string;
}

interface RazorpaySdkPayment {
  id: string;
  order_id?: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string;
  captured?: boolean;
  captured_at?: number | null;
  created_at?: number;
  error_description?: string | null;
}

interface RazorpaySdk {
  orders: {
    create(input: {
      amount: number;
      currency: string;
      receipt: string;
      notes?: Record<string, string>;
      payment_capture?: boolean;
    }): Promise<RazorpaySdkOrder>;
  };
  payments: {
    fetch(id: string): Promise<RazorpaySdkPayment>;
    all(query: { from: number; to: number; count?: number; skip?: number }): Promise<{
      items: RazorpaySdkPayment[];
      count: number;
    }>;
  };
}

export function createRazorpayClient(config: Config, logger: Logger): RazorpayClient {
  if (config.razorpayUseStub) {
    logger.warn("razorpay_stub_mode_enabled");
    return createStubClient(config);
  }
  return createRealClient(config, logger);
}

function createRealClient(config: Config, logger: Logger): RazorpayClient {
  // Razorpay SDK is CJS. createRequire avoids ESM/CJS interop surprises
  // and keeps the dependency out of the bundle until real keys are configured.
  const requireFn = createRequire(import.meta.url);
  const Razorpay = requireFn("razorpay") as new (opts: {
    key_id: string;
    key_secret: string;
  }) => RazorpaySdk;
  const sdk = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
  });

  return {
    keyId: config.razorpayKeyId,
    isStub: false,

    async createOrder(input) {
      const order = await sdk.orders.create({
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.receipt,
        ...(input.notes ? { notes: input.notes } : {}),
        payment_capture: true,
      });
      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt ?? null,
        status: order.status,
      };
    },

    async fetchPayment(razorpayPaymentId) {
      try {
        const p = await sdk.payments.fetch(razorpayPaymentId);
        return toPayment(p);
      } catch (err) {
        logger.warn({ err, razorpayPaymentId }, "razorpay_fetch_payment_failed");
        return null;
      }
    },

    async listPaymentsForDay(date) {
      const from = startOfDayUtc(date).getTime() / 1000;
      const to = from + 24 * 60 * 60 - 1;
      const out: RazorpayPayment[] = [];
      // Razorpay caps at 100 per page; bound skip to prevent runaway loops.
      const MAX_SKIP = 10_000;
      for (let skip = 0; skip <= MAX_SKIP; skip += 100) {
        const page = await sdk.payments.all({ from, to, count: 100, skip });
        for (const item of page.items) out.push(toPayment(item));
        if (page.items.length < 100) break;
      }
      return out;
    },

    verifyWebhookSignature(rawBody, signature) {
      return verifySignature(rawBody, signature, config.razorpayWebhookSecret);
    },
  };
}

function createStubClient(config: Config): RazorpayClient {
  return {
    keyId: config.razorpayKeyId,
    isStub: true,

    async createOrder(input) {
      const id = `order_stub_${randomBytes(8).toString("hex")}`;
      return {
        id,
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.receipt,
        status: "created",
      };
    },

    async fetchPayment() {
      return null;
    },

    async listPaymentsForDay() {
      return [];
    },

    verifyWebhookSignature(rawBody, signature) {
      return verifySignature(rawBody, signature, config.razorpayWebhookSecret);
    },
  };
}

function toPayment(p: RazorpaySdkPayment): RazorpayPayment {
  return {
    id: p.id,
    orderId: p.order_id ?? null,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    method: p.method,
    capturedAt: p.captured_at ?? null,
    failureReason: p.error_description ?? null,
  };
}

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function startOfDayUtc(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
