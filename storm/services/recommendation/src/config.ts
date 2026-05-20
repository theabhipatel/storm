import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3009),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  redisUrl: z.string().min(1),
  catalogBaseUrl: z.string().url(),
  searchBaseUrl: z.string().url(),
  inventoryBaseUrl: z.string().url(),
  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1),
  kafkaGroupId: z.string().min(1),
  productRefreshMs: z.coerce.number().int().positive().default(6 * 60 * 60 * 1000),
  categoryRefreshMs: z.coerce.number().int().positive().default(60 * 60 * 1000),
  userTtlSec: z.coerce.number().int().positive().default(60 * 60),
  productTtlSec: z.coerce.number().int().positive().default(6 * 60 * 60),
  popularPriceBandPct: z.coerce.number().int().min(0).max(100).default(25),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    redisUrl: process.env["REDIS_URL"] ?? "redis://localhost:6379/0",
    catalogBaseUrl: process.env["CATALOG_BASE_URL"] ?? "http://localhost:3002",
    searchBaseUrl: process.env["SEARCH_BASE_URL"] ?? "http://localhost:3003",
    inventoryBaseUrl: process.env["INVENTORY_BASE_URL"] ?? "http://localhost:3004",
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"] ?? "recommendation-service",
    kafkaGroupId: process.env["KAFKA_GROUP_ID"] ?? "recommendation-service",
    productRefreshMs: process.env["PRODUCT_REFRESH_MS"],
    categoryRefreshMs: process.env["CATEGORY_REFRESH_MS"],
    userTtlSec: process.env["USER_TTL_SEC"],
    productTtlSec: process.env["PRODUCT_TTL_SEC"],
    popularPriceBandPct: process.env["POPULAR_PRICE_BAND_PCT"],
  });
}

export const SERVICE_NAME = "recommendation";
