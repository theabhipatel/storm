import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3000),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  catalogBaseUrl: z.string().url(),
  mediaBaseUrl: z.string().url(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    catalogBaseUrl: process.env["CATALOG_BASE_URL"] ?? "http://localhost:3002",
    mediaBaseUrl: process.env["MEDIA_BASE_URL"] ?? "http://localhost:3011",
  });
}

export const SERVICE_NAME = "web-bff";
