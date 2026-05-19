import type { OpenSearchClient } from "../infra/opensearch.js";

// Dedup store for consumer eventIds.
// `create` op-type so a second attempt with the same id returns 409 → already processed.
export function processedEventsRepo(os: OpenSearchClient, index: string) {
  async function markIfNew(eventId: string, eventType: string): Promise<boolean> {
    try {
      await os.index({
        index,
        id: eventId,
        op_type: "create",
        body: {
          eventId,
          eventType,
          processedAt: new Date().toISOString(),
        },
        refresh: false,
      });
      return true;
    } catch (err: unknown) {
      const status = (err as { meta?: { statusCode?: number } }).meta?.statusCode;
      if (status === 409) return false;
      throw err;
    }
  }

  async function unmark(eventId: string): Promise<void> {
    try {
      await os.delete({ index, id: eventId, refresh: false });
    } catch (err: unknown) {
      const status = (err as { meta?: { statusCode?: number } }).meta?.statusCode;
      if (status !== 404) throw err;
    }
  }

  return { markIfNew, unmark };
}

export type ProcessedEventsRepo = ReturnType<typeof processedEventsRepo>;
