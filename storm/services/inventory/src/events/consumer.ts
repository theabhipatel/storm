import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";
import type { Logger } from "@storm/logger";
import {
  CatalogEventTypes,
  OrderEventTypes,
  ProductCreatedPayload,
  ProductPublishedPayload,
  OrderConfirmedPayload,
  OrderFailedPayload,
  OrderCancelledPayload,
  EventEnvelopeSchema,
  type EventEnvelope,
} from "@storm/contracts";

import type { Config } from "../config.js";
import type { PrismaClient } from "../db.js";
import type { StockService } from "../services/stockService.js";
import type { ReservationService } from "../services/reservationService.js";

export interface ConsumerDeps {
  config: Config;
  prisma: PrismaClient;
  logger: Logger;
  stock: StockService;
  reservations: ReservationService;
}

const SUBSCRIBED_TOPICS = [
  CatalogEventTypes.ProductCreated,
  CatalogEventTypes.ProductPublished,
  OrderEventTypes.Confirmed,
  OrderEventTypes.Failed,
  OrderEventTypes.Cancelled,
];

export interface InventoryConsumer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createConsumer(deps: ConsumerDeps): InventoryConsumer {
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
    deps.logger.info({ topics: SUBSCRIBED_TOPICS }, "inventory_consumer_started");
  }

  async function stop(): Promise<void> {
    if (!running) return;
    running = false;
    await consumer.disconnect();
  }

  return { start, stop };
}

async function handleMessage(payload: EachMessagePayload, deps: ConsumerDeps): Promise<void> {
  const raw = payload.message.value;
  if (!raw) return;
  let envelope: EventEnvelope;
  try {
    envelope = EventEnvelopeSchema.parse(JSON.parse(raw.toString("utf8")));
  } catch (err) {
    deps.logger.error({ err, topic: payload.topic }, "envelope_parse_failed");
    return;
  }
  // Dedup
  try {
    await deps.prisma.processedEvent.create({
      data: {
        eventId: envelope.eventId,
        eventType: envelope.eventType,
      },
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      deps.logger.debug({ eventId: envelope.eventId }, "event_duplicate_skipped");
      return;
    }
    throw err;
  }
  try {
    await dispatch(envelope, deps);
  } catch (err) {
    deps.logger.error(
      { err, eventId: envelope.eventId, eventType: envelope.eventType },
      "event_handler_failed",
    );
    await deps.prisma.processedEvent
      .delete({ where: { eventId: envelope.eventId } })
      .catch(() => undefined);
    throw err;
  }
}

async function dispatch(envelope: EventEnvelope, deps: ConsumerDeps): Promise<void> {
  switch (envelope.eventType) {
    case CatalogEventTypes.ProductCreated: {
      const p = ProductCreatedPayload.parse(envelope.payload);
      await deps.stock.ensureForSku({
        sku: p.sku,
        productId: p.productId,
        productName: p.name,
      });
      return;
    }
    case CatalogEventTypes.ProductPublished: {
      const p = ProductPublishedPayload.parse(envelope.payload);
      await deps.stock.ensureForSku({
        sku: p.sku,
        productId: p.productId,
        productName: p.name,
      });
      return;
    }
    case OrderEventTypes.Confirmed: {
      const p = OrderConfirmedPayload.parse(envelope.payload);
      if (!p.reservationId) return;
      await deps.reservations.confirm(p.reservationId).catch((err: unknown) => {
        deps.logger.warn({ err, orderId: p.orderId }, "confirm_skipped");
      });
      return;
    }
    case OrderEventTypes.Failed: {
      const p = OrderFailedPayload.parse(envelope.payload);
      if (!p.reservationId) return;
      await deps.reservations.release(p.reservationId, "order_failed").catch((err: unknown) => {
        deps.logger.warn({ err, orderId: p.orderId }, "release_skipped");
      });
      return;
    }
    case OrderEventTypes.Cancelled: {
      const p = OrderCancelledPayload.parse(envelope.payload);
      await deps.reservations.restock(p.orderId, "order_cancelled").catch((err: unknown) => {
        deps.logger.warn({ err, orderId: p.orderId }, "restock_skipped");
      });
      return;
    }
    default:
      return;
  }
}
