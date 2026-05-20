import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";
import {
  PaymentEventTypes,
  PaymentCapturedPayload,
  PaymentFailedPayload,
  EventEnvelopeSchema,
  type EventEnvelope,
} from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";
import type { PrismaClient } from "../db.js";
import type { OrderService } from "../services/orderService.js";

const SUBSCRIBED_TOPICS = [PaymentEventTypes.Captured, PaymentEventTypes.Failed];

export interface OrderConsumer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createConsumer(deps: {
  config: Config;
  prisma: PrismaClient;
  service: OrderService;
  logger: Logger;
}): OrderConsumer {
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
    deps.logger.info({ topics: SUBSCRIBED_TOPICS }, "order_consumer_started");
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
  deps: { prisma: PrismaClient; service: OrderService; logger: Logger },
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

async function dispatch(
  envelope: EventEnvelope,
  deps: { service: OrderService; logger: Logger },
): Promise<void> {
  switch (envelope.eventType) {
    case PaymentEventTypes.Captured: {
      const p = PaymentCapturedPayload.parse(envelope.payload);
      await deps.service.handlePaymentCaptured({
        razorpayOrderId: p.razorpayOrderId,
        paidAt: new Date(p.capturedAt),
      });
      return;
    }
    case PaymentEventTypes.Failed: {
      const p = PaymentFailedPayload.parse(envelope.payload);
      await deps.service.handlePaymentFailed({
        razorpayOrderId: p.razorpayOrderId,
        reason: p.reason,
      });
      return;
    }
    default:
      return;
  }
}
