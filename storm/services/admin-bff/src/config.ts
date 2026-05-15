import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3100),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
  });
}

export const SERVICE_NAME = "admin-bff";
