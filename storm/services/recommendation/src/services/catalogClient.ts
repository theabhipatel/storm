import { StormError, ErrorCodes } from "@storm/contracts";

import type { Config } from "../config.js";

export interface CatalogProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brandId: string;
  categoryId: string;
  basePrice: number;
  currency: string;
  status: "draft" | "published" | "archived";
  primaryMediaId: string | null;
}

export function catalogClient(config: Config) {
  async function lookupByIds(ids: string[]): Promise<CatalogProduct[]> {
    if (ids.length === 0) return [];
    const url = `${config.catalogBaseUrl}/api/internal/products?ids=${encodeURIComponent(ids.join(","))}`;
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

  return { lookupByIds, lookupBySkus };
}

export type CatalogClient = ReturnType<typeof catalogClient>;
