import { Kafka, Partitioners, type Producer } from "kafkajs";

import type { Config } from "../config.js";

export interface OutboxProducer {
  send(input: {
    topic: string;
    key: string;
    envelope: EventEnvelope;
  }): Promise<void>;
  disconnect(): Promise<void>;
}

export interface EventEnvelope {
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: string;
  producer: string;
  traceId?: string;
  payload: unknown;
}

export function createProducer(config: Config): OutboxProducer {
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

  return {
    async send({ topic, key, envelope }) {
      const p = await ensureConnected();
      await p.send({
        topic,
        messages: [
          {
            key,
            value: JSON.stringify(envelope),
            headers: {
              "event-id": envelope.eventId,
              "event-type": envelope.eventType,
              "event-version": String(envelope.eventVersion),
              producer: envelope.producer,
              ...(envelope.traceId ? { "trace-id": envelope.traceId } : {}),
            },
          },
        ],
      });
    },
    async disconnect() {
      if (producer) {
        await producer.disconnect();
        producer = undefined;
      }
    },
  };
}

export function parseEventVersion(eventType: string): number {
  const match = /\.v(\d+)$/.exec(eventType);
  return match ? Number.parseInt(match[1]!, 10) : 1;
}
