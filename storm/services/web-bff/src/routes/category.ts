import { Router } from "express";
import { StormError, ErrorCodes, type SearchResponse } from "@storm/contracts";

import type { Config } from "../config.js";
import { catalogClient, type CategoryNode } from "../services/catalogClient.js";
import { searchClient } from "../services/searchClient.js";

export interface CategoryListingResponse {
  category: { id: string; name: string; slug: string };
  breadcrumb: { id: string; name: string; slug: string }[];
  subcategories: { id: string; name: string; slug: string }[];
  results: SearchResponse;
}

export function categoryRouter(config: Config): Router {
  const router = Router();
  const catalog = catalogClient(config);
  const search = searchClient(config);

  router.get("/api/c/:slug", async (req, res, next) => {
    try {
      const slug = req.params.slug!;
      const tree = await catalog.fetchCategoryTree();
      const located = locate(tree, slug);
      if (!located) {
        throw new StormError({
          code: ErrorCodes.NOT_FOUND,
          message: "Category not found.",
          status: 404,
        });
      }
      const { node, path } = located;
      const passed = req.query as Record<string, string | string[] | undefined>;
      const results = await search.search({
        ...passed,
        categoryId: node.id,
      });
      const out: CategoryListingResponse = {
        category: { id: node.id, name: node.name, slug: node.slug },
        breadcrumb: path.map((n) => ({ id: n.id, name: n.name, slug: n.slug })),
        subcategories: node.children.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
        results,
      };
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function locate(
  tree: CategoryNode[],
  slug: string,
): { node: CategoryNode; path: CategoryNode[] } | null {
  function walk(nodes: CategoryNode[], trail: CategoryNode[]): { node: CategoryNode; path: CategoryNode[] } | null {
    for (const n of nodes) {
      const next = [...trail, n];
      if (n.slug === slug) return { node: n, path: next };
      const hit = walk(n.children, next);
      if (hit) return hit;
    }
    return null;
  }
  return walk(tree, []);
}
