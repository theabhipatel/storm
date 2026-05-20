import { StormError, ErrorCodes } from "@storm/contracts";

import type { Config } from "../config.js";

export function inventoryClient(config: Config) {
  async function getStock(skus: string[]): Promise<Map<string, number>> {
    if (skus.length === 0) return new Map();
    const url = `${config.inventoryBaseUrl}/api/internal/stock?skus=${encodeURIComponent(skus.join(","))}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new StormError({
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: `Inventory responded with ${res.status}.`,
        status: 502,
      });
    }
    const body = (await res.json()) as {
      data: { sku: string; quantityAvailable: number }[];
    };
    return new Map(body.data.map((d) => [d.sku, d.quantityAvailable]));
  }

  return { getStock };
}

export type InventoryClient = ReturnType<typeof inventoryClient>;
