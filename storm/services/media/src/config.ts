import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3011),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  databaseUrl: z.string().min(1),
  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1),

  // S3 / MinIO
  s3Endpoint: z.string().url(),
  s3Region: z.string().default("us-east-1"),
  s3Bucket: z.string().min(1),
  s3AccessKey: z.string().min(1),
  s3SecretKey: z.string().min(1),
  s3ForcePathStyle: z.coerce.boolean().default(true),
  // Public URL prefix browsers use to fetch objects (CDN in prod, MinIO locally).
  s3PublicBaseUrl: z.string().url(),

  uploadUrlTtlSeconds: z.coerce.number().int().positive().default(300),
  thumbnailWorkerIntervalMs: z.coerce.number().int().positive().default(2000),
  thumbnailMaxRetries: z.coerce.number().int().min(0).default(3),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],
    databaseUrl:
      process.env["DATABASE_URL"] ??
      "postgresql://media:media_pw@localhost:5432/media?schema=public",
    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"] ?? "media-service",
    s3Endpoint: process.env["S3_ENDPOINT"] ?? "http://localhost:9000",
    s3Region: process.env["S3_REGION"] ?? "us-east-1",
    s3Bucket: process.env["S3_BUCKET"] ?? "storm-media",
    s3AccessKey: process.env["S3_ACCESS_KEY"] ?? "minio",
    s3SecretKey: process.env["S3_SECRET_KEY"] ?? "minio12345",
    s3ForcePathStyle: process.env["S3_FORCE_PATH_STYLE"] ?? "true",
    s3PublicBaseUrl:
      process.env["S3_PUBLIC_BASE_URL"] ?? "http://localhost:9000/storm-media",
    uploadUrlTtlSeconds: process.env["UPLOAD_URL_TTL_SECONDS"],
    thumbnailWorkerIntervalMs: process.env["THUMBNAIL_WORKER_INTERVAL_MS"],
    thumbnailMaxRetries: process.env["THUMBNAIL_MAX_RETRIES"],
  });
}

export const SERVICE_NAME = "media";
