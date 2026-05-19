import { StormError, ErrorCodes, type ProductDetail } from "@storm/contracts";

import type { Config } from "../config.js";

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  children: CategoryNode[];
}

export function catalogClient(config: Config) {
  async function fetchProductBySlug(slug: string): Promise<ProductDetail> {
    const url = `${config.catalogBaseUrl}/api/products/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.status === 404) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Product not found.",
        status: 404,
      });
    }
    if (!res.ok) {
      throw new StormError({
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: `Catalog responded with ${res.status}.`,
        status: 502,
      });
    }
    return (await res.json()) as ProductDetail;
  }

  async function fetchCategoryTree(): Promise<CategoryNode[]> {
    const url = `${config.catalogBaseUrl}/api/categories`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new StormError({
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: `Catalog responded with ${res.status}.`,
        status: 502,
      });
    }
    const body = (await res.json()) as { items: CategoryNode[] };
    return body.items;
  }

  async function fetchBrands(): Promise<{ id: string; name: string; slug: string }[]> {
    const url = `${config.catalogBaseUrl}/api/brands`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new StormError({
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: `Catalog responded with ${res.status}.`,
        status: 502,
      });
    }
    const body = (await res.json()) as { items: { id: string; name: string; slug: string }[] };
    return body.items;
  }

  return { fetchProductBySlug, fetchCategoryTree, fetchBrands };
}
