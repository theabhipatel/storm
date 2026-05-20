import type { RecommendationList } from "@storm/contracts";

import type { Config } from "../config.js";

export function recsClient(config: Config) {
  async function forProduct(productId: string): Promise<RecommendationList | null> {
    try {
      const res = await fetch(
        `${config.recommendationBaseUrl}/api/recs/products/${encodeURIComponent(productId)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) return null;
      return (await res.json()) as RecommendationList;
    } catch {
      return null;
    }
  }

  return { forProduct };
}

export type RecsClient = ReturnType<typeof recsClient>;
