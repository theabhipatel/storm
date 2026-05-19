import type { Logger } from "@storm/logger";

import type { OpenSearchClient } from "./opensearch.js";
import {
  PROCESSED_EVENTS_MAPPING,
  PRODUCTS_INDEX_MAPPING,
  PRODUCTS_INDEX_SETTINGS,
} from "./mapping.js";

export interface BootstrapOptions {
  os: OpenSearchClient;
  alias: string;
  processedEventsIndex: string;
  logger: Logger;
}

// On startup: ensure the alias resolves to at least one physical index.
// If the alias does not exist, create `<alias>_v1` with current mapping and
// point the alias at it. Subsequent re-indexes go to v2/v3 via /admin/reindex.
export async function bootstrapIndices(opts: BootstrapOptions): Promise<void> {
  const { os, alias, processedEventsIndex, logger } = opts;
  await ensureProductsAlias(os, alias, logger);
  await ensureProcessedEventsIndex(os, processedEventsIndex, logger);
}

async function ensureProductsAlias(
  os: OpenSearchClient,
  alias: string,
  logger: Logger,
): Promise<void> {
  const aliasExists = await os.indices
    .existsAlias({ name: alias })
    .then((r) => r.body)
    .catch(() => false);
  if (aliasExists) {
    logger.info({ alias }, "products_alias_present");
    return;
  }
  const physical = `${alias}_v1`;
  const physicalExists = await os.indices
    .exists({ index: physical })
    .then((r) => r.body)
    .catch(() => false);
  if (!physicalExists) {
    await os.indices.create({
      index: physical,
      body: {
        settings: PRODUCTS_INDEX_SETTINGS as unknown as Record<string, unknown>,
        mappings: PRODUCTS_INDEX_MAPPING as unknown as Record<string, unknown>,
      },
    });
    logger.info({ index: physical }, "products_index_created");
  }
  await os.indices.putAlias({ index: physical, name: alias });
  logger.info({ alias, index: physical }, "products_alias_created");
}

async function ensureProcessedEventsIndex(
  os: OpenSearchClient,
  index: string,
  logger: Logger,
): Promise<void> {
  const exists = await os.indices
    .exists({ index })
    .then((r) => r.body)
    .catch(() => false);
  if (exists) return;
  await os.indices.create({
    index,
    body: {
      settings: { number_of_shards: 1, number_of_replicas: 0 },
      mappings: PROCESSED_EVENTS_MAPPING as unknown as Record<string, unknown>,
    },
  });
  logger.info({ index }, "processed_events_index_created");
}

// Resolve the alias to its current physical index name.
export async function resolveAliasTarget(
  os: OpenSearchClient,
  alias: string,
): Promise<string | null> {
  try {
    const res = await os.indices.getAlias({ name: alias });
    const indices = Object.keys(res.body ?? {});
    return indices[0] ?? null;
  } catch {
    return null;
  }
}

// Pick the next physical index name (`<alias>_v<N+1>`).
export function nextVersionedIndex(currentIndex: string | null, alias: string): string {
  if (!currentIndex) return `${alias}_v1`;
  const match = /_v(\d+)$/.exec(currentIndex);
  const next = match ? Number.parseInt(match[1]!, 10) + 1 : 2;
  return `${alias}_v${next}`;
}
