import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3004),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  databaseUrl: z.string().min(1),
  grpcPort: z.coerce.number().int().positive().default(50051),
  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1),
  kafkaGroupId: z.string().min(1),
  sweepIntervalMs: z.coerce.number().int().positive().default(60_000),
  lowStockIntervalMs: z.coerce.number().int().positive().default(3_600_000),
  defaultReservationTtlSec: z.coerce.number().int().positive().default(900),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    databaseUrl:
      process.env["DATABASE_URL"] ??
      "postgresql://inventory:inventory@localhost:5432/inventory?schema=public",
    grpcPort: process.env["GRPC_PORT"],
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"] ?? "inventory-service",
    kafkaGroupId: process.env["KAFKA_GROUP_ID"] ?? "inventory-service",
    sweepIntervalMs: process.env["SWEEP_INTERVAL_MS"],
    lowStockIntervalMs: process.env["LOW_STOCK_INTERVAL_MS"],
    defaultReservationTtlSec: process.env["DEFAULT_RESERVATION_TTL_SEC"],
  });
}

export const SERVICE_NAME = "inventory";
