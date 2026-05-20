import { Kafka, type Consumer, type Producer } from "kafkajs";
import { EventEnvelopeSchema } from "@storm/contracts";

import type { Config } from "../config.js";
import type { HandlerDeps } from "../handlers/identity.js";
import { allEventHandlers as eventHandlers } from "../handlers/registry.js";

export interface ConsumerSetup {
  consumer: Consumer;
  dlqProducer: Producer;
  start(): Promise<void>;
  stop(): Promise<void>;
}

const BACKOFF_MS = [10_000, 30_000, 90_000];

export async function createNotificationConsumer(
  config: Config,
  deps: HandlerDeps,
): Promise<ConsumerSetup> {
  const kafka = new Kafka({
    clientId: config.kafkaClientId,
    brokers: config.kafkaBrokers.split(",").map((s) => s.trim()),
  });

  const consumer = kafka.consumer({
    groupId: config.kafkaConsumerGroup,
    allowAutoTopicCreation: true,
  });
  const dlqProducer = kafka.producer({ allowAutoTopicCreation: true });

  const subscribedTopics = Object.keys(eventHandlers);
  const { logger } = deps;

  async function start(): Promise<void> {
    await consumer.connect();
    await dlqProducer.connect();
    for (const topic of subscribedTopics) {
      await consumer.subscribe({ topic, fromBeginning: true });
    }
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        let envelope;
        try {
          envelope = EventEnvelopeSchema.parse(JSON.parse(message.value.toString()));
        } catch (err) {
          logger.error({ err, topic }, "event_envelope_parse_failed");
          await toDlq(topic, message.value, message.headers, "envelope_parse_failed", err);
          return;
        }

        // Dedup: insert eventId; if already present, skip handler.
        try {
          await deps.mongo.processedEvents.insertOne({
            _id: envelope.eventId,
            processedAt: new Date(),
          });
        } catch (err: unknown) {
          if (isMongoDuplicateKey(err)) {
            logger.debug(
              { eventId: envelope.eventId, eventType: envelope.eventType },
              "event_duplicate_skipped",
            );
            return;
          }
          throw err;
        }

        const handler = eventHandlers[envelope.eventType];
        if (!handler) {
          logger.warn({ eventType: envelope.eventType }, "no_handler_for_event_type");
          return;
        }

        let lastErr: unknown;
        for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
          try {
            await handler(
              {
                eventId: envelope.eventId,
                eventType: envelope.eventType,
                payload: envelope.payload,
              },
              deps,
            );
            return;
          } catch (err) {
            lastErr = err;
            logger.warn(
              {
                eventId: envelope.eventId,
                eventType: envelope.eventType,
                attempt,
                err,
              },
              "handler_attempt_failed",
            );
            if (attempt < config.maxAttempts) {
              await sleep(BACKOFF_MS[attempt - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1]!);
            }
          }
        }
        // Out of retries → DLQ + mark log row failed.
        await deps.mongo.logs.updateOne(
          { eventId: envelope.eventId },
          {
            $set: {
              eventId: envelope.eventId,
              status: "failed",
              failedAt: new Date(),
              errorMessage: (lastErr as Error)?.message ?? "unknown",
            },
            $inc: { attempts: 0 },
          },
          { upsert: true },
        );
        // Allow re-processing on manual retry → remove from dedup set.
        await deps.mongo.processedEvents.deleteOne({ _id: envelope.eventId });
        await toDlq(topic, message.value, message.headers, "max_attempts_exceeded", lastErr);
        logger.error(
          { eventId: envelope.eventId, eventType: envelope.eventType, topic, partition },
          "event_sent_to_dlq",
        );
      },
    });
  }

  async function stop(): Promise<void> {
    await consumer.disconnect().catch(() => undefined);
    await dlqProducer.disconnect().catch(() => undefined);
  }

  async function toDlq(
    sourceTopic: string,
    value: Buffer,
    headers: Record<string, Buffer | string | (Buffer | string)[] | undefined> | undefined,
    reason: string,
    error: unknown,
  ): Promise<void> {
    try {
      await dlqProducer.send({
        topic: `${sourceTopic}.dlq`,
        messages: [
          {
            value,
            headers: {
              ...(headers ?? {}),
              "dlq-reason": reason,
              "dlq-error": (error as Error)?.message ?? String(error ?? ""),
              "dlq-source-topic": sourceTopic,
            },
          },
        ],
      });
    } catch (err) {
      logger.error({ err, sourceTopic }, "dlq_publish_failed");
    }
  }

  return { consumer, dlqProducer, start, stop };
}

function isMongoDuplicateKey(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { code?: number }).code === 11000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
