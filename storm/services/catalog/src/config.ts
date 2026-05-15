import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3002),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  databaseUrl: z.string().min(1),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    databaseUrl: process.env["DATABASE_URL"] ?? "postgresql://catalog:catalog@localhost:5432/catalog?schema=public",
  });
}

export const SERVICE_NAME = "catalog";
