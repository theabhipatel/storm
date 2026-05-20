import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3005),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  redisUrl: z.string().min(1),
  cartTtlSeconds: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),
  catalogBaseUrl: z.string().url(),
  inventoryBaseUrl: z.string().url(),
  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1),
  kafkaGroupId: z.string().min(1),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    redisUrl: process.env["REDIS_URL"] ?? "redis://localhost:6379/0",
    cartTtlSeconds: process.env["CART_TTL_SECONDS"],
    catalogBaseUrl: process.env["CATALOG_BASE_URL"] ?? "http://localhost:3002",
    inventoryBaseUrl: process.env["INVENTORY_BASE_URL"] ?? "http://localhost:3004",
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"] ?? "cart-service",
    kafkaGroupId: process.env["KAFKA_GROUP_ID"] ?? "cart-service",
  });
}

export const SERVICE_NAME = "cart";
