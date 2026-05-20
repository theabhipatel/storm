import { uuidv7 } from "uuidv7";
import type { Prisma } from "../db.js";

export interface OutboxAppendInput {
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export async function appendOutbox(
  tx: Prisma.TransactionClient,
  input: OutboxAppendInput,
): Promise<void> {
  await tx.outbox.create({
    data: {
      id: uuidv7(),
      aggregateId: input.aggregateId,
      eventType: input.eventType,
      payload: input.payload as Prisma.InputJsonValue,
    },
  });
}
