import { StormError, ErrorCodes } from "@storm/contracts";

import type { Config } from "../config.js";

export interface CatalogProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  basePrice: number;
  currency: string;
  status: "draft" | "published" | "archived";
  primaryMediaId: string | null;
}

export function catalogClient(config: Config) {
  async function lookupBySkus(skus: string[]): Promise<CatalogProduct[]> {
    if (skus.length === 0) return [];
    const url = `${config.catalogBaseUrl}/api/internal/products?skus=${encodeURIComponent(skus.join(","))}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new StormError({
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: `Catalog responded with ${res.status}.`,
        status: 502,
      });
    }
    const body = (await res.json()) as { data: CatalogProduct[] };
    return body.data;
  }

  return { lookupBySkus };
}

export type CatalogClient = ReturnType<typeof catalogClient>;
