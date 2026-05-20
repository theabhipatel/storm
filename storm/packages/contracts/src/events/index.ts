/**
 * Kafka event envelope schemas.
 * Per-event payload schemas added on each owning service's day.
 */
import { z } from "zod";

export const EventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string().min(1),
  eventVersion: z.number().int().positive(),
  occurredAt: z.string().datetime(),
  producer: z.string().min(1),
  traceId: z.string().optional(),
  payload: z.unknown(),
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

export * from "./identity.js";
export * from "./catalog.js";
export * from "./media.js";
export * from "./inventory.js";
export * from "./cart.js";
export * from "./order.js";
export * from "./payment.js";
