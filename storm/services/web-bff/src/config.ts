import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3000),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  catalogBaseUrl: z.string().url(),
  mediaBaseUrl: z.string().url(),
  searchBaseUrl: z.string().url(),
  cartBaseUrl: z.string().url(),
  wishlistBaseUrl: z.string().url(),
  recommendationBaseUrl: z.string().url(),
  inventoryBaseUrl: z.string().url(),
  orderBaseUrl: z.string().url(),
  notificationBaseUrl: z.string().url(),
  redisUrl: z.string().min(1),
  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1),
  kafkaGroupId: z.string().min(1).default("storm-web-bff"),
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
    catalogBaseUrl: process.env["CATALOG_BASE_URL"] ?? "http://localhost:3002",
    mediaBaseUrl: process.env["MEDIA_BASE_URL"] ?? "http://localhost:3011",
    searchBaseUrl: process.env["SEARCH_BASE_URL"] ?? "http://localhost:3003",
    cartBaseUrl: process.env["CART_BASE_URL"] ?? "http://localhost:3005",
    wishlistBaseUrl: process.env["WISHLIST_BASE_URL"] ?? "http://localhost:3008",
    recommendationBaseUrl: process.env["RECOMMENDATION_BASE_URL"] ?? "http://localhost:3009",
    inventoryBaseUrl: process.env["INVENTORY_BASE_URL"] ?? "http://localhost:3004",
    orderBaseUrl: process.env["ORDER_BASE_URL"] ?? "http://localhost:3006",
    notificationBaseUrl: process.env["NOTIFICATION_BASE_URL"] ?? "http://localhost:3010",
    redisUrl: process.env["REDIS_URL"] ?? "redis://localhost:6379",
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"] ?? "web-bff",
    kafkaGroupId: process.env["KAFKA_GROUP_ID"],
    enableConsumer: process.env["WEB_BFF_ENABLE_CONSUMER"],
  });
}

export const SERVICE_NAME = "web-bff";
