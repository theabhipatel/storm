import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";
import type { Logger } from "@storm/logger";
import {
  CatalogEventTypes,
  ProductArchivedPayload,
  EventEnvelopeSchema,
  type EventEnvelope,
} from "@storm/contracts";

import type { Config } from "../config.js";
import type { PrismaClient } from "../db.js";

export interface WishlistConsumer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

const SUBSCRIBED_TOPICS = [
  CatalogEventTypes.ProductArchived,
];

export function createConsumer(deps: {
  config: Config;
  prisma: PrismaClient;
  logger: Logger;
}): WishlistConsumer {
  const kafka = new Kafka({
    clientId: deps.config.kafkaClientId,
    brokers: deps.config.kafkaBrokers.split(",").map((s) => s.trim()),
  });
  const consumer: Consumer = kafka.consumer({
    groupId: deps.config.kafkaGroupId,
    allowAutoTopicCreation: true,
  });
  let running = false;

  async function start(): Promise<void> {
    if (running) return;
    await consumer.connect();
    for (const topic of SUBSCRIBED_TOPICS) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }
    running = true;
    await consumer.run({
      autoCommit: true,
      eachMessage: async (payload) => handleMessage(payload, deps),
    });
    deps.logger.info({ topics: SUBSCRIBED_TOPICS }, "wishlist_consumer_started");
  }

  async function stop(): Promise<void> {
    if (!running) return;
    running = false;
    await consumer.disconnect();
  }

  return { start, stop };
}

async function handleMessage(
  payload: EachMessagePayload,
  deps: { prisma: PrismaClient; logger: Logger },
): Promise<void> {
  const raw = payload.message.value;
  if (!raw) return;
  let envelope: EventEnvelope;
  try {
    envelope = EventEnvelopeSchema.parse(JSON.parse(raw.toString("utf8")));
  } catch (err) {
    deps.logger.error({ err, topic: payload.topic }, "envelope_parse_failed");
    return;
  }
  try {
    await deps.prisma.processedEvent.create({
      data: { eventId: envelope.eventId, eventType: envelope.eventType },
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") return;
    throw err;
  }
  try {
    if (envelope.eventType === CatalogEventTypes.ProductArchived) {
      const p = ProductArchivedPayload.parse(envelope.payload);
      const r = await deps.prisma.wishlistItem.deleteMany({ where: { sku: p.sku } });
      deps.logger.info({ sku: p.sku, removed: r.count }, "wishlist_purged_on_archive");
    }
  } catch (err) {
    deps.logger.error({ err, eventId: envelope.eventId }, "wishlist_handler_failed");
    await deps.prisma.processedEvent
      .delete({ where: { eventId: envelope.eventId } })
      .catch(() => undefined);
    throw err;
  }
}
