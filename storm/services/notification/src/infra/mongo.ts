import { MongoClient, type Collection, type Db } from "mongodb";

import type { Config } from "../config.js";

export interface NotificationLog {
  _id?: unknown;
  eventId: string;
  userId: string;
  channel: "email" | "sms";
  templateId: string;
  templateVersion: number;
  payload: Record<string, unknown>;
  status: "queued" | "sent" | "failed";
  providerResponse?: unknown;
  attempts: number;
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
}

export interface TemplateRow {
  _id: string; // templateId
  channel: "email" | "sms";
  locale: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  smsBody?: string;
  version: number;
  createdAt: Date;
}

export interface ProcessedEvent {
  _id: string; // eventId
  processedAt: Date;
}

export interface MongoState {
  client: MongoClient;
  db: Db;
  logs: Collection<NotificationLog>;
  templates: Collection<TemplateRow>;
  processedEvents: Collection<ProcessedEvent>;
}

export async function connectMongo(config: Config): Promise<MongoState> {
  const client = new MongoClient(config.mongoUrl, { ignoreUndefined: true });
  await client.connect();
  const db = client.db(config.mongoDbName);

  const logs = db.collection<NotificationLog>("notification_logs");
  const templates = db.collection<TemplateRow>("templates");
  const processedEvents = db.collection<ProcessedEvent>("processed_events");

  await Promise.all([
    logs.createIndex({ eventId: 1 }, { unique: true }),
    logs.createIndex({ userId: 1, sentAt: -1 }),
    logs.createIndex({ status: 1 }),
    templates.createIndex({ channel: 1, locale: 1 }),
    // ttl: drop dedup keys after 7 days to keep collection bounded.
    processedEvents.createIndex({ processedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }),
  ]);

  return { client, db, logs, templates, processedEvents };
}

export async function disconnectMongo(state: MongoState | undefined): Promise<void> {
  if (state) await state.client.close();
}
