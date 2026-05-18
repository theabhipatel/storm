import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3010),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),

  mongoUrl: z.string().min(1),
  mongoDbName: z.string().min(1).default("notification"),

  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1).default("notification-service"),
  kafkaConsumerGroup: z.string().min(1).default("notification-service"),

  // Email provider: "mailhog" (local SMTP), "ses" (real)
  emailProvider: z.enum(["mailhog", "ses"]).default("mailhog"),
  emailFrom: z.string().min(1).default("Storm <no-reply@storm.local>"),

  // Mailhog
  smtpHost: z.string().min(1).default("localhost"),
  smtpPort: z.coerce.number().int().positive().default(1025),

  // SES (used when emailProvider=ses)
  awsRegion: z.string().min(1).default("ap-south-1"),

  // Twilio. Empty creds -> SMS adapter logs only (stub mode).
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioFromNumber: z.string().optional(),

  // Verification + reset URLs (used inside templates)
  webAppOrigin: z.string().min(1).default("http://localhost:3000"),

  // Retry policy
  maxAttempts: z.coerce.number().int().positive().default(3),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],

    mongoUrl:
      process.env["MONGO_URL"] ??
      "mongodb://notification:notification_pw@localhost:27018/notification?authSource=notification",
    mongoDbName: process.env["MONGO_DB_NAME"],

    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"],
    kafkaConsumerGroup: process.env["KAFKA_CONSUMER_GROUP"],

    emailProvider: process.env["EMAIL_PROVIDER"],
    emailFrom: process.env["EMAIL_FROM"],

    smtpHost: process.env["SMTP_HOST"],
    smtpPort: process.env["SMTP_PORT"],

    awsRegion: process.env["AWS_REGION"],

    twilioAccountSid: process.env["TWILIO_ACCOUNT_SID"],
    twilioAuthToken: process.env["TWILIO_AUTH_TOKEN"],
    twilioFromNumber: process.env["TWILIO_FROM_NUMBER"],

    webAppOrigin: process.env["WEB_APP_ORIGIN"],

    maxAttempts: process.env["MAX_ATTEMPTS"],
  });
}

export const SERVICE_NAME = "notification";
