// OpenSearch index settings + mapping for the products index.
// Re-indexing flow: build a new `<alias>_v<N>` index, reindex docs, swap alias.

export const PRODUCTS_INDEX_SETTINGS = {
  analysis: {
    filter: {
      storm_edge_ngram: {
        type: "edge_ngram",
        min_gram: 2,
        max_gram: 10,
      },
    },
    analyzer: {
      storm_autocomplete: {
        type: "custom",
        tokenizer: "standard",
        filter: ["lowercase", "storm_edge_ngram"],
      },
      storm_autocomplete_search: {
        type: "custom",
        tokenizer: "standard",
        filter: ["lowercase"],
      },
    },
    normalizer: {
      lowercase: {
        type: "custom",
        filter: ["lowercase"],
      },
    },
  },
  number_of_shards: 1,
  number_of_replicas: 0,
} as const;

export const PRODUCTS_INDEX_MAPPING = {
  dynamic: "strict",
  properties: {
    productId: { type: "keyword" },
    sku: { type: "keyword" },
    slug: { type: "keyword" },
    name: {
      type: "text",
      analyzer: "standard",
      fields: {
        keyword: { type: "keyword", ignore_above: 256 },
        autocomplete: {
          type: "text",
          analyzer: "storm_autocomplete",
          search_analyzer: "storm_autocomplete_search",
        },
      },
    },
    description: { type: "text", analyzer: "standard" },
    brandId: { type: "keyword" },
    brandName: {
      type: "keyword",
      normalizer: "lowercase",
      fields: { text: { type: "text", analyzer: "standard" } },
    },
    categoryIds: { type: "keyword" },
    categoryNames: {
      type: "keyword",
      normalizer: "lowercase",
      fields: { text: { type: "text", analyzer: "standard" } },
    },
    attributes: { type: "flat_object" },
    basePrice: { type: "integer" },
    currency: { type: "keyword" },
    inStock: { type: "boolean" },
    popularityScore: { type: "float" },
    primaryImageUrl: { type: "keyword", index: false },
    status: { type: "keyword" },
    createdAt: { type: "date" },
    updatedAt: { type: "date" },
  },
} as const;

export const PROCESSED_EVENTS_MAPPING = {
  dynamic: "strict",
  properties: {
    eventId: { type: "keyword" },
    eventType: { type: "keyword" },
    processedAt: { type: "date" },
  },
} as const;
