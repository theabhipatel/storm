import { Kafka, type Consumer } from "kafkajs";
import type { Logger } from "@storm/logger";
import {
  CatalogEventTypes,
  EventEnvelopeSchema,
} from "@storm/contracts";

import type { Config } from "../config.js";
import type { Cache } from "../services/cache.js";

const TOPICS = [
  CatalogEventTypes.ProductPublished,
  CatalogEventTypes.ProductUpdated,
  CatalogEventTypes.ProductArchived,
  CatalogEventTypes.CategoryUpdated,
  CatalogEventTypes.BrandUpdated,
];

export interface CacheInvalidator {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface InvalidatorDeps {
  config: Config;
  cache: Cache;
  logger: Logger;
}

export function createCacheInvalidator(deps: InvalidatorDeps): CacheInvalidator {
  const kafka = new Kafka({
    clientId: `${deps.config.kafkaClientId}-cache`,
    brokers: deps.config.kafkaBrokers.split(",").map((s) => s.trim()),
  });
  const consumer: Consumer = kafka.consumer({
    groupId: deps.config.kafkaGroupId,
    allowAutoTopicCreation: true,
  });
  let running = false;

  return {
    async start() {
      if (running) return;
      await consumer.connect();
      for (const topic of TOPICS) {
        await consumer.subscribe({ topic, fromBeginning: false });
      }
      running = true;
      await consumer.run({
        autoCommit: true,
        eachMessage: async ({ message, topic }) => {
          if (!message.value) return;
          try {
            EventEnvelopeSchema.parse(JSON.parse(message.value.toString("utf8")));
          } catch (err) {
            deps.logger.error({ err, topic }, "envelope_parse_failed");
            return;
          }
          // For Stage 1 we drop the entire web-bff cache namespace on any
          // catalog change. TTL is 30s, so the blast radius is small and the
          // implementation stays trivial.
          const removed = await deps.cache.delByPrefix("home:");
          deps.logger.debug({ topic, removed }, "cache_keys_invalidated");
        },
      });
      deps.logger.info({ topics: TOPICS }, "web_bff_cache_invalidator_started");
    },
    async stop() {
      if (!running) return;
      running = false;
      await consumer.disconnect();
    },
  };
}
