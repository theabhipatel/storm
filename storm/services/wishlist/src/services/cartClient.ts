import { uuidv7 } from "uuidv7";
import { StormError, ErrorCodes } from "@storm/contracts";

import type { Config } from "../config.js";

export function cartClient(config: Config) {
  async function addItem(args: {
    userId: string;
    productId: string;
    qty: number;
  }): Promise<void> {
    const res = await fetch(`${config.cartBaseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": args.userId,
        "x-user-role": "customer",
        "idempotency-key": uuidv7(),
      },
      body: JSON.stringify({ productId: args.productId, qty: args.qty }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
      throw new StormError({
        code: body?.error?.code ?? ErrorCodes.SERVICE_UNAVAILABLE,
        message: body?.error?.message ?? `Cart responded with ${res.status}.`,
        status: res.status,
      });
    }
  }

  return { addItem };
}

export type CartClient = ReturnType<typeof cartClient>;
