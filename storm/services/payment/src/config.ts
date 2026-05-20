import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3007),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  databaseUrl: z.string().min(1),
  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1).default("payment-service"),

  razorpayKeyId: z.string().min(1),
  razorpayKeySecret: z.string().min(1),
  razorpayWebhookSecret: z.string().min(1),
  razorpayUseStub: z.coerce.boolean().default(false),

  reconciliationCron: z.string().default("0 3 * * *"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    databaseUrl:
      process.env["DATABASE_URL"] ??
      "postgresql://payment:payment_pw@localhost:5432/payment?schema=public",
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"],

    razorpayKeyId: process.env["RAZORPAY_KEY_ID"] ?? "rzp_test_stub",
    razorpayKeySecret: process.env["RAZORPAY_KEY_SECRET"] ?? "rzp_secret_stub",
    razorpayWebhookSecret: process.env["RAZORPAY_WEBHOOK_SECRET"] ?? "rzp_webhook_stub",
    razorpayUseStub: process.env["RAZORPAY_USE_STUB"] ?? "true",

    reconciliationCron: process.env["RECONCILIATION_CRON"],
  });
}

export const SERVICE_NAME = "payment";
