import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";
import type { Logger } from "@storm/logger";
import {
  CatalogEventTypes,
  OrderEventTypes,
  InventoryEventTypes,
  ProductArchivedPayload,
  OrderConfirmedPayload,
  InventoryStockChangedPayload,
  EventEnvelopeSchema,
  type EventEnvelope,
} from "@storm/contracts";

import type { Config } from "../config.js";
import type { CartRepo } from "../repositories/cartRepo.js";

// Cart-service does not maintain a secondary index of "carts containing sku".
// In Stage 1 we keep this consumer simple: invalidations apply on next read
// (cart re-fetches fresh prices and stock anyway). The only handler that does
// real work is Order.Confirmed → clear that user's cart.
export interface CartConsumer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

const SUBSCRIBED_TOPICS = [
  OrderEventTypes.Confirmed,
  CatalogEventTypes.ProductArchived,
  CatalogEventTypes.ProductUpdated,
  InventoryEventTypes.StockChanged,
];

export function createConsumer(deps: {
  config: Config;
  repo: CartRepo;
  logger: Logger;
}): CartConsumer {
  const kafka = new Kafka({
    clientId: deps.config.kafkaClientId + "-consumer",
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
    deps.logger.info({ topics: SUBSCRIBED_TOPICS }, "cart_consumer_started");
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
  deps: { repo: CartRepo; logger: Logger },
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
  switch (envelope.eventType) {
    case OrderEventTypes.Confirmed: {
      const p = OrderConfirmedPayload.parse(envelope.payload);
      await deps.repo.clear(p.userId);
      deps.logger.info({ userId: p.userId, orderId: p.orderId }, "cart_cleared_on_order");
      return;
    }
    case CatalogEventTypes.ProductArchived: {
      // Cart re-fetches prices/availability on next read; nothing to do here.
      const p = ProductArchivedPayload.parse(envelope.payload);
      deps.logger.debug({ productId: p.productId }, "product_archived_noted");
      return;
    }
    case InventoryEventTypes.StockChanged: {
      // Same: items show `available=false` on next read via inventory client.
      const p = InventoryStockChangedPayload.parse(envelope.payload);
      deps.logger.debug({ sku: p.sku, qty: p.quantityOnHand }, "stock_changed_noted");
      return;
    }
    default:
      return;
  }
}
