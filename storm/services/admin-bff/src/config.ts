import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3100),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  orderBaseUrl: z.string().url().default("http://localhost:3006"),
  paymentBaseUrl: z.string().url().default("http://localhost:3007"),
  inventoryBaseUrl: z.string().url().default("http://localhost:3004"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    orderBaseUrl: process.env["ORDER_BASE_URL"],
    paymentBaseUrl: process.env["PAYMENT_BASE_URL"],
    inventoryBaseUrl: process.env["INVENTORY_BASE_URL"],
  });
}

export const SERVICE_NAME = "admin-bff";
