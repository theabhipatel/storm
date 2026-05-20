import { Router } from "express";
import type { MediaAssetDto, ProductDetail, RecommendationList } from "@storm/contracts";

import type { Config } from "../config.js";
import { catalogClient, type CategoryNode } from "../services/catalogClient.js";
import { mediaClient } from "../services/mediaClient.js";
import { inventoryClient } from "../services/inventoryClient.js";
import { recsClient } from "../services/recsClient.js";

export interface BreadcrumbItem {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetailResponse extends ProductDetail {
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  breadcrumb: BreadcrumbItem[];
  mediaAssets: MediaAssetDto[];
  stock: { sku: string; available: number; inStock: boolean };
  recommendations: RecommendationList | null;
}

export function productRouter(config: Config): Router {
  const router = Router();
  const catalog = catalogClient(config);
  const media = mediaClient(config);
  const inventory = inventoryClient(config);
  const recs = recsClient(config);

  router.get("/api/p/:slug", async (req, res, next) => {
    try {
      const product = await catalog.fetchProductBySlug(req.params.slug!);
      const [tree, brands, assets, stockMap, recommendations] = await Promise.all([
        catalog.fetchCategoryTree(),
        catalog.fetchBrands(),
        media.fetchBatch(product.media.map((m) => m.mediaId)),
        inventory.getStock([product.sku]).catch(() => new Map<string, number>()),
        recs.forProduct(product.id),
      ]);
      const brand = brands.find((b) => b.id === product.brandId) ?? null;
      const { node: category, path } = locateCategory(tree, product.categoryId);
      const available = stockMap.get(product.sku) ?? 0;
      const response: ProductDetailResponse = {
        ...product,
        brand,
        category: category
          ? { id: category.id, name: category.name, slug: category.slug }
          : null,
        breadcrumb: path,
        mediaAssets: assets,
        stock: { sku: product.sku, available, inStock: available > 0 },
        recommendations,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function locateCategory(
  tree: CategoryNode[],
  categoryId: string,
): { node: CategoryNode | null; path: BreadcrumbItem[] } {
  function walk(nodes: CategoryNode[], trail: BreadcrumbItem[]):
    | { node: CategoryNode; path: BreadcrumbItem[] }
    | null {
    for (const n of nodes) {
      const next = [...trail, { id: n.id, name: n.name, slug: n.slug }];
      if (n.id === categoryId) return { node: n, path: next };
      const found = walk(n.children, next);
      if (found) return found;
    }
    return null;
  }
  const hit = walk(tree, []);
  return hit ? { node: hit.node, path: hit.path } : { node: null, path: [] };
}
