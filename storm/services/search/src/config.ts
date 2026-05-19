import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3003),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  opensearchUrl: z.string().url(),
  productsIndexAlias: z.string().min(1).default("products"),
  processedEventsIndex: z.string().min(1).default("search_processed_events"),
  catalogBaseUrl: z.string().url(),
  mediaBaseUrl: z.string().url(),
  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1),
  kafkaGroupId: z.string().min(1).default("storm-search"),
  enableConsumer: z
    .union([z.literal("true"), z.literal("false")])
    .default("true")
    .transform((v) => v === "true"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    opensearchUrl: process.env["OPENSEARCH_URL"] ?? "http://localhost:9200",
    productsIndexAlias: process.env["SEARCH_PRODUCTS_ALIAS"],
    processedEventsIndex: process.env["SEARCH_PROCESSED_EVENTS_INDEX"],
    catalogBaseUrl: process.env["CATALOG_BASE_URL"] ?? "http://localhost:3002",
    mediaBaseUrl: process.env["MEDIA_BASE_URL"] ?? "http://localhost:3011",
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"] ?? "search-service",
    kafkaGroupId: process.env["KAFKA_GROUP_ID"],
    enableConsumer: process.env["SEARCH_ENABLE_CONSUMER"],
  });
}

export const SERVICE_NAME = "search";
