import { uuidv7 } from "uuidv7";
import { Kafka, Partitioners, type Producer } from "kafkajs";
import { CartEventTypes, type CartItemAdded } from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";

// Cart is a Redis-only service, so we don't have a transactional outbox.
// Stage 1 publishes Cart.ItemAdded.v1 best-effort directly to Kafka.
// Consumers tolerate at-most-once for this analytics signal.
export interface CartEventPublisher {
  emitItemAdded(payload: CartItemAdded): Promise<void>;
  disconnect(): Promise<void>;
}

export function createEventPublisher(config: Config, logger: Logger): CartEventPublisher {
  const kafka = new Kafka({
    clientId: config.kafkaClientId,
    brokers: config.kafkaBrokers.split(",").map((s) => s.trim()),
  });
  let producer: Producer | undefined;
  let connecting: Promise<Producer> | undefined;

  async function ensureConnected(): Promise<Producer> {
    if (producer) return producer;
    if (!connecting) {
      const p = kafka.producer({
        allowAutoTopicCreation: true,
        idempotent: true,
        maxInFlightRequests: 5,
        createPartitioner: Partitioners.DefaultPartitioner,
      });
      connecting = p.connect().then(() => {
        producer = p;
        return p;
      });
    }
    return connecting;
  }

  async function emitItemAdded(payload: CartItemAdded): Promise<void> {
    try {
      const p = await ensureConnected();
      const envelope = {
        eventId: uuidv7(),
        eventType: CartEventTypes.ItemAdded,
        eventVersion: 1,
        occurredAt: new Date().toISOString(),
        producer: config.kafkaClientId,
        payload,
      };
      await p.send({
        topic: CartEventTypes.ItemAdded,
        messages: [
          {
            key: payload.userId,
            value: JSON.stringify(envelope),
            headers: {
              "event-id": envelope.eventId,
              "event-type": envelope.eventType,
              "event-version": "1",
              producer: envelope.producer,
            },
          },
        ],
      });
    } catch (err) {
      logger.warn({ err }, "cart_event_send_failed");
    }
  }

  async function disconnect(): Promise<void> {
    if (producer) {
      await producer.disconnect();
      producer = undefined;
    }
  }

  return { emitItemAdded, disconnect };
}
