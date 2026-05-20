import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3008),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  databaseUrl: z.string().min(1),
  catalogBaseUrl: z.string().url(),
  inventoryBaseUrl: z.string().url(),
  cartBaseUrl: z.string().url(),
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
    databaseUrl:
      process.env["DATABASE_URL"] ??
      "postgresql://wishlist:wishlist@localhost:5432/wishlist?schema=public",
    catalogBaseUrl: process.env["CATALOG_BASE_URL"] ?? "http://localhost:3002",
    inventoryBaseUrl: process.env["INVENTORY_BASE_URL"] ?? "http://localhost:3004",
    cartBaseUrl: process.env["CART_BASE_URL"] ?? "http://localhost:3005",
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"] ?? "wishlist-service",
    kafkaGroupId: process.env["KAFKA_GROUP_ID"] ?? "wishlist-service",
  });
}

export const SERVICE_NAME = "wishlist";
