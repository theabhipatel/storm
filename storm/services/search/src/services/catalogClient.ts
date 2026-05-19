import { StormError, ErrorCodes } from "@storm/contracts";

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

export interface BrandRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSnapshot {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  basePrice: number;
  currency: string;
  status: "draft" | "published" | "archived";
  attributes: Record<string, string | number | boolean>;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  media: { mediaId: string; order: number; isPrimary: boolean }[];
}

export function catalogClient(config: Config) {
  async function fetchBrands(): Promise<BrandRef[]> {
    const res = await fetch(`${config.catalogBaseUrl}/api/brands`);
    if (!res.ok) throw unavailable("catalog", res.status);
    const body = (await res.json()) as { items: BrandRef[] };
    return body.items;
  }

  async function fetchCategoryTree(): Promise<CategoryNode[]> {
    const res = await fetch(`${config.catalogBaseUrl}/api/categories`);
    if (!res.ok) throw unavailable("catalog", res.status);
    const body = (await res.json()) as { items: CategoryNode[] };
    return body.items;
  }

  async function fetchProductBySlug(slug: string): Promise<ProductSnapshot | null> {
    const res = await fetch(`${config.catalogBaseUrl}/api/products/${encodeURIComponent(slug)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw unavailable("catalog", res.status);
    return (await res.json()) as ProductSnapshot;
  }

  return { fetchBrands, fetchCategoryTree, fetchProductBySlug };
}

function unavailable(svc: string, status: number): StormError {
  return new StormError({
    code: ErrorCodes.SERVICE_UNAVAILABLE,
    message: `${svc} responded with ${status}.`,
    status: 502,
  });
}

// Walk the tree, return the [ancestor, ..., self] for a category id.
export function categoryLineage(
  tree: CategoryNode[],
  categoryId: string,
): CategoryNode[] {
  function walk(nodes: CategoryNode[], trail: CategoryNode[]): CategoryNode[] | null {
    for (const n of nodes) {
      const next = [...trail, n];
      if (n.id === categoryId) return next;
      const hit = walk(n.children, next);
      if (hit) return hit;
    }
    return null;
  }
  return walk(tree, []) ?? [];
}

// Flatten the tree into an id → node map.
export function flattenCategories(tree: CategoryNode[]): Map<string, CategoryNode> {
  const out = new Map<string, CategoryNode>();
  function walk(nodes: CategoryNode[]): void {
    for (const n of nodes) {
      out.set(n.id, n);
      walk(n.children);
    }
  }
  walk(tree);
  return out;
}
