import { StormError, ErrorCodes, type Cart } from "@storm/contracts";

import type { Config } from "../config.js";

export interface CartClient {
  getCart(userId: string): Promise<Cart>;
}

export function createCartClient(config: Config): CartClient {
  return {
    async getCart(userId) {
      const res = await fetch(`${config.cartBaseUrl}/api/cart`, {
        headers: {
          Accept: "application/json",
          "x-user-id": userId,
          "x-user-role": "customer",
        },
      });
      if (!res.ok) {
        throw new StormError({
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: `Cart responded with ${res.status}.`,
          status: 502,
        });
      }
      return (await res.json()) as Cart;
    },
  };
}
