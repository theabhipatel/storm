import { StormError, ErrorCodes } from "@storm/contracts";

import type { Config } from "../config.js";

export interface PaymentClientCreateResponse {
  paymentId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: "INR";
  razorpayKeyId: string;
}

export interface PaymentClient {
  createPayment(input: {
    orderId: string;
    amountPaise: number;
    currency: "INR";
  }): Promise<PaymentClientCreateResponse>;
}

export function createPaymentClient(config: Config): PaymentClient {
  return {
    async createPayment(input) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.paymentCallTimeoutMs);
      try {
        const res = await fetch(`${config.paymentBaseUrl}/api/internal/payments`, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new StormError({
            code: ErrorCodes.PAYMENT_GATEWAY_ERROR,
            message: `Payment service responded with ${res.status}.`,
            status: 502,
          });
        }
        return (await res.json()) as PaymentClientCreateResponse;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          throw new StormError({
            code: ErrorCodes.SERVICE_UNAVAILABLE,
            message: "Payment service timed out.",
            status: 504,
          });
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
