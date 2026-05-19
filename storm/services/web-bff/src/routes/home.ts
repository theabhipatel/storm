import { Router } from "express";
import type { SearchHit } from "@storm/contracts";

import type { Config } from "../config.js";
import type { Cache } from "../services/cache.js";
import { catalogClient, type CategoryNode } from "../services/catalogClient.js";
import { searchClient } from "../services/searchClient.js";

export interface HomeCategoryCard {
  id: string;
  name: string;
  slug: string;
}

export interface HomeBrandCard {
  id: string;
  name: string;
  slug: string;
}

export interface HomeResponse {
  topCategories: HomeCategoryCard[];
  topSellers: SearchHit[];
  featuredBrands: HomeBrandCard[];
}

const TTL_SECONDS = 30;

export function homeRouter(config: Config, cache: Cache): Router {
  const router = Router();
  const catalog = catalogClient(config);
  const search = searchClient(config);

  router.get("/api/home", async (_req, res, next) => {
    try {
      const out = await cache.withCache<HomeResponse>(
        "home:v1",
        TTL_SECONDS,
        async () => {
          const [tree, brands, sellers] = await Promise.all([
            catalog.fetchCategoryTree(),
            catalog.fetchBrands(),
            search.search({ sort: "popularity", limit: "12" }),
          ]);
          return {
            topCategories: topCategories(tree, 8),
            topSellers: sellers.data,
            featuredBrands: brands.slice(0, 4),
          };
        },
      );
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function topCategories(tree: CategoryNode[], limit: number): HomeCategoryCard[] {
  return [...tree]
    .sort((a, b) => a.order - b.order)
    .slice(0, limit)
    .map((n) => ({ id: n.id, name: n.name, slug: n.slug }));
}

