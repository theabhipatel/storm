import { Router } from "express";
import type { FacetsResponse } from "@storm/contracts";

import type { Config } from "../config.js";
import { searchClient } from "../services/searchClient.js";
import { catalogClient, type CategoryNode } from "../services/catalogClient.js";

// Pass-through to search-service. The /facets path additionally enriches
// brand and category facet labels with display names from the catalog tree,
// since search-service only stores ids on aggregations to keep its index
// schema simple.
export function searchRouter(config: Config): Router {
  const router = Router();
  const search = searchClient(config);
  const catalog = catalogClient(config);

  router.get("/api/search", async (req, res, next) => {
    try {
      const out = await search.search(req.query as Record<string, string | string[] | undefined>);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/autocomplete", async (req, res, next) => {
    try {
      const q = (req.query["q"] as string | undefined) ?? "";
      const out = await search.autocomplete(q);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/facets", async (req, res, next) => {
    try {
      const raw = await search.facets(req.query as Record<string, string | string[] | undefined>);
      const [brands, categoryTree] = await Promise.all([
        catalog.fetchBrands().catch(() => []),
        catalog.fetchCategoryTree().catch<CategoryNode[]>(() => []),
      ]);
      const brandNames = new Map(brands.map((b) => [b.id, b.name]));
      const categoryNames = flattenCategoryNames(categoryTree);
      const enriched: FacetsResponse = {
        ...raw,
        brands: raw.brands.map((b) => ({
          ...b,
          label: brandNames.get(b.value) ?? b.label,
        })),
        categories: raw.categories.map((c) => ({
          ...c,
          label: categoryNames.get(c.value) ?? c.label,
        })),
      };
      res.json(enriched);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function flattenCategoryNames(tree: CategoryNode[]): Map<string, string> {
  const out = new Map<string, string>();
  function walk(nodes: CategoryNode[]): void {
    for (const n of nodes) {
      out.set(n.id, n.name);
      walk(n.children);
    }
  }
  walk(tree);
  return out;
}
