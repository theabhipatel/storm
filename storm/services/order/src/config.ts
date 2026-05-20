import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3006),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),

  databaseUrl: z.string().min(1),
  redisUrl: z.string().min(1),

  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1).default("order-service"),
  kafkaGroupId: z.string().min(1).default("order-service"),

  cartBaseUrl: z.string().url(),
  identityBaseUrl: z.string().url(),
  paymentBaseUrl: z.string().url(),
  catalogBaseUrl: z.string().url(),
  notificationBaseUrl: z.string().url(),

  inventoryGrpcAddress: z.string().min(1).default("localhost:50051"),
  inventoryReserveTimeoutMs: z.coerce.number().int().positive().default(800),
  paymentCallTimeoutMs: z.coerce.number().int().positive().default(5000),
  reservationTtlSec: z.coerce.number().int().positive().default(15 * 60),

  freeShippingThresholdPaise: z.coerce.number().int().nonnegative().default(50_000),
  flatShippingFeePaise: z.coerce.number().int().nonnegative().default(5_000),

  idempotencyTtlSec: z.coerce.number().int().positive().default(24 * 60 * 60),
  ttlSweepIntervalMs: z.coerce.number().int().positive().default(5 * 60 * 1000),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    databaseUrl:
      process.env["DATABASE_URL"] ??
      "postgresql://order:order_pw@localhost:5432/order?schema=public",
    redisUrl: process.env["REDIS_URL"] ?? "redis://localhost:6379",
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"],
    kafkaGroupId: process.env["KAFKA_GROUP_ID"],

    cartBaseUrl: process.env["CART_BASE_URL"] ?? "http://localhost:3005",
    identityBaseUrl: process.env["IDENTITY_BASE_URL"] ?? "http://localhost:3001",
    paymentBaseUrl: process.env["PAYMENT_BASE_URL"] ?? "http://localhost:3007",
    catalogBaseUrl: process.env["CATALOG_BASE_URL"] ?? "http://localhost:3002",
    notificationBaseUrl: process.env["NOTIFICATION_BASE_URL"] ?? "http://localhost:3008",

    inventoryGrpcAddress: process.env["INVENTORY_GRPC_ADDRESS"],
    inventoryReserveTimeoutMs: process.env["INVENTORY_RESERVE_TIMEOUT_MS"],
    paymentCallTimeoutMs: process.env["PAYMENT_CALL_TIMEOUT_MS"],
    reservationTtlSec: process.env["RESERVATION_TTL_SEC"],

    freeShippingThresholdPaise: process.env["FREE_SHIPPING_THRESHOLD_PAISE"],
    flatShippingFeePaise: process.env["FLAT_SHIPPING_FEE_PAISE"],

    idempotencyTtlSec: process.env["IDEMPOTENCY_TTL_SEC"],
    ttlSweepIntervalMs: process.env["TTL_SWEEP_INTERVAL_MS"],
  });
}

export const SERVICE_NAME = "order";
