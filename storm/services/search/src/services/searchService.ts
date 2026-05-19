import {
  SearchQuerySchema,
  type SearchHit,
  type SearchResponse,
  type SearchQueryParsed,
  type FacetsResponse,
  type AutocompleteResponse,
} from "@storm/contracts";

import type { OpenSearchClient } from "../infra/opensearch.js";

const PRICE_BUCKETS: { from: number; to: number | null }[] = [
  { from: 0, to: 50000 }, // ≤ ₹500
  { from: 50000, to: 200000 }, // ₹500 – ₹2,000
  { from: 200000, to: 500000 }, // ₹2,000 – ₹5,000
  { from: 500000, to: 1000000 }, // ₹5,000 – ₹10,000
  { from: 1000000, to: 5000000 }, // ₹10,000 – ₹50,000
  { from: 5000000, to: null }, // > ₹50,000
];

export function searchService(os: OpenSearchClient, alias: string) {
  async function search(rawQuery: unknown): Promise<SearchResponse> {
    const q = SearchQuerySchema.parse(rawQuery);
    const { body } = await os.search<SearchEsResponse>({
      index: alias,
      body: buildSearchBody(q),
    });
    const hits = body.hits.hits;
    const data = hits.map((h) => toHit(h._source));
    let nextCursor: string | null = null;
    const hasMore = hits.length === q.limit;
    if (hasMore) {
      const last = hits[hits.length - 1];
      if (last?.sort) nextCursor = encodeCursor(last.sort);
    }
    return { data, page: { nextCursor, hasMore, limit: q.limit } };
  }

  async function autocomplete(query: string): Promise<AutocompleteResponse> {
    const q = (query ?? "").trim();
    if (q.length === 0) return { items: [] };
    const { body } = await os.search<SearchEsResponse>({
      index: alias,
      body: {
        size: 10,
        _source: ["productId", "name", "slug", "primaryImageUrl", "basePrice", "currency"],
        query: {
          multi_match: {
            query: q,
            fields: ["name.autocomplete^3", "name^2", "brandName.text", "categoryNames.text"],
            type: "best_fields",
            operator: "and",
          },
        },
      },
    });
    return {
      items: body.hits.hits.map((h) => ({
        kind: "product" as const,
        id: h._source.productId,
        label: h._source.name,
        slug: h._source.slug,
        primaryImageUrl: h._source.primaryImageUrl,
        basePrice: h._source.basePrice,
        currency: h._source.currency,
      })),
    };
  }

  async function facets(rawQuery: unknown): Promise<FacetsResponse> {
    const q = SearchQuerySchema.parse(rawQuery);
    const body = buildSearchBody(q, { aggregations: true, hits: false });
    const { body: res } = await os.search<SearchEsResponse>({ index: alias, body });
    const agg = res.aggregations ?? {};
    const total =
      typeof res.hits.total === "number"
        ? res.hits.total
        : res.hits.total?.value ?? 0;
    // Labels intentionally left as ids — web-bff enriches them using its
    // catalog tree cache so we don't need a top_hits sub-agg here (which is
    // unreliable for array fields like categoryNames).
    return {
      brands: (agg["brands"]?.buckets ?? []).map((b) => ({
        value: b.key as string,
        label: b.key as string,
        count: b.doc_count,
      })),
      categories: (agg["categories"]?.buckets ?? []).map((b) => ({
        value: b.key as string,
        label: b.key as string,
        count: b.doc_count,
      })),
      priceBuckets: (agg["priceBuckets"]?.buckets ?? []).map((b, i) => ({
        from: PRICE_BUCKETS[i]?.from ?? 0,
        to: PRICE_BUCKETS[i]?.to ?? null,
        count: b.doc_count,
      })),
      inStockCount: agg["inStock"]?.doc_count ?? 0,
      totalCount: total,
    };
  }

  return { search, autocomplete, facets };
}

interface EsBucket {
  key: string | number;
  doc_count: number;
}
interface EsAggBuckets {
  buckets: EsBucket[];
}
interface EsAggFilter {
  doc_count: number;
}
type EsAgg = EsAggBuckets & EsAggFilter & Record<string, unknown>;

interface SearchEsResponse {
  hits: {
    total: number | { value: number; relation?: string };
    hits: {
      _id: string;
      _source: SearchDocSource;
      sort?: (string | number)[];
    }[];
  };
  aggregations?: Record<string, EsAgg>;
}

interface SearchDocSource {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  brandId: string;
  brandName: string;
  categoryIds: string[];
  categoryNames: string[];
  basePrice: number;
  currency: string;
  inStock: boolean;
  primaryImageUrl: string | null;
  popularityScore: number;
  createdAt: string;
}

function toHit(src: SearchDocSource): SearchHit {
  return {
    productId: src.productId,
    sku: src.sku,
    slug: src.slug,
    name: src.name,
    brandId: src.brandId,
    brandName: src.brandName,
    categoryIds: src.categoryIds,
    categoryNames: src.categoryNames,
    basePrice: src.basePrice,
    currency: src.currency,
    inStock: src.inStock,
    primaryImageUrl: src.primaryImageUrl,
    popularityScore: src.popularityScore,
    createdAt: src.createdAt,
  };
}

function buildSearchBody(
  q: SearchQueryParsed,
  opts: { aggregations?: boolean; hits?: boolean } = {},
): Record<string, unknown> {
  const filters: Record<string, unknown>[] = [];
  if (q.categoryId) filters.push({ term: { categoryIds: q.categoryId } });
  if (q.brandId && q.brandId.length > 0) {
    filters.push({ terms: { brandId: q.brandId } });
  }
  if (q.priceMin !== undefined || q.priceMax !== undefined) {
    const range: Record<string, number> = {};
    if (q.priceMin !== undefined) range["gte"] = q.priceMin;
    if (q.priceMax !== undefined) range["lte"] = q.priceMax;
    filters.push({ range: { basePrice: range } });
  }
  if (q.inStock !== undefined) filters.push({ term: { inStock: q.inStock } });

  const must: Record<string, unknown>[] = [];
  if (q.q && q.q.trim().length > 0) {
    must.push({
      multi_match: {
        query: q.q.trim(),
        fields: ["name^3", "brandName.text^2", "categoryNames.text", "description"],
        operator: "and",
        type: "best_fields",
      },
    });
  } else {
    must.push({ match_all: {} });
  }

  const baseQuery = { bool: { must, filter: filters } };
  // Relevance sort: BM25 + popularity boost (plan §Sort behavior).
  // Other sorts ignore _score, so the function_score wrapper is unnecessary.
  const query =
    q.sort === "relevance"
      ? {
          function_score: {
            query: baseQuery,
            field_value_factor: {
              field: "popularityScore",
              modifier: "log1p",
              factor: 1,
              missing: 0,
            },
            boost_mode: "sum",
          },
        }
      : baseQuery;
  const sort = buildSort(q);

  const body: Record<string, unknown> = { query };
  if (opts.hits !== false) {
    body["size"] = q.limit;
    body["sort"] = sort;
    if (q.cursor) body["search_after"] = decodeCursor(q.cursor);
  } else {
    body["size"] = 0;
  }
  if (opts.aggregations) {
    body["aggs"] = {
      brands: { terms: { field: "brandId", size: 30 } },
      // Aggregating on categoryIds means ancestors get counted too — that's
      // intentional. Users on /search see top-level categories to drill into.
      categories: { terms: { field: "categoryIds", size: 30 } },
      inStock: { filter: { term: { inStock: true } } },
      priceBuckets: {
        range: {
          field: "basePrice",
          ranges: PRICE_BUCKETS.map((b) => ({
            from: b.from,
            ...(b.to !== null ? { to: b.to } : {}),
          })),
        },
      },
    };
  }
  return body;
}

function buildSort(q: SearchQueryParsed): unknown[] {
  switch (q.sort) {
    case "price-asc":
      return [{ basePrice: "asc" }, { productId: "asc" }];
    case "price-desc":
      return [{ basePrice: "desc" }, { productId: "asc" }];
    case "popularity":
      return [{ popularityScore: "desc" }, { productId: "asc" }];
    case "newness":
      return [{ createdAt: "desc" }, { productId: "asc" }];
    case "relevance":
    default:
      return [{ _score: "desc" }, { productId: "asc" }];
  }
}

function encodeCursor(sortValues: (string | number)[]): string {
  return Buffer.from(JSON.stringify(sortValues), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): unknown[] {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as unknown[];
  } catch {
    return [];
  }
}
