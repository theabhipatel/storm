import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3004),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  databaseUrl: z.string().min(1),
  redisUrl: z.string().min(1).optional(),
  grpcPort: z.coerce.number().int().positive().default(50051),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    databaseUrl: process.env["DATABASE_URL"] ?? "postgresql://inventory:inventory@localhost:5432/inventory?schema=public",
    redisUrl: process.env["REDIS_URL"],
    grpcPort: process.env["GRPC_PORT"],
  });
}

export const SERVICE_NAME = "inventory";
