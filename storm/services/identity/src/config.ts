import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3001),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),

  databaseUrl: z.string().min(1),
  redisUrl: z.string().min(1),

  kafkaBrokers: z.string().min(1),
  kafkaClientId: z.string().min(1).default("identity-service"),

  jwtPrivateKey: z.string().min(1),
  jwtPublicKey: z.string().min(1),
  jwtKid: z.string().min(1),
  jwtIssuer: z.string().min(1).default("storm-identity"),
  jwtAudience: z.string().min(1).default("storm"),
  accessTokenTtlSec: z.coerce.number().int().positive().default(15 * 60),
  refreshTokenTtlSec: z.coerce.number().int().positive().default(7 * 24 * 60 * 60),
  emailVerifyTtlSec: z.coerce.number().int().positive().default(24 * 60 * 60),
  passwordResetTtlSec: z.coerce.number().int().positive().default(30 * 60),
  otpTtlSec: z.coerce.number().int().positive().default(5 * 60),
  oauthStateTtlSec: z.coerce.number().int().positive().default(5 * 60),

  cookieDomain: z.string().optional(),
  cookieSecure: z.coerce.boolean().default(false),

  googleOauthClientId: z.string().optional(),
  googleOauthClientSecret: z.string().optional(),
  googleOauthRedirectUri: z.string().optional(),

  hibpUserAgent: z.string().min(1).default("storm-identity"),

  webAppOrigin: z.string().min(1).default("http://localhost:3000"),
  adminAppOrigin: z.string().min(1).default("http://localhost:5173"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],

    databaseUrl:
      process.env["DATABASE_URL"] ??
      "postgresql://identity:identity_pw@localhost:5432/identity?schema=public",
    redisUrl: process.env["REDIS_URL"] ?? "redis://localhost:6379",

    kafkaBrokers: process.env["KAFKA_BROKERS"] ?? "localhost:19092",
    kafkaClientId: process.env["KAFKA_CLIENT_ID"],

    jwtPrivateKey: process.env["JWT_PRIVATE_KEY"] ?? "",
    jwtPublicKey: process.env["JWT_PUBLIC_KEY"] ?? "",
    jwtKid: process.env["JWT_KID"] ?? "",
    jwtIssuer: process.env["JWT_ISSUER"],
    jwtAudience: process.env["JWT_AUDIENCE"],
    accessTokenTtlSec: process.env["ACCESS_TOKEN_TTL_SEC"],
    refreshTokenTtlSec: process.env["REFRESH_TOKEN_TTL_SEC"],
    emailVerifyTtlSec: process.env["EMAIL_VERIFY_TTL_SEC"],
    passwordResetTtlSec: process.env["PASSWORD_RESET_TTL_SEC"],
    otpTtlSec: process.env["OTP_TTL_SEC"],
    oauthStateTtlSec: process.env["OAUTH_STATE_TTL_SEC"],

    cookieDomain: process.env["COOKIE_DOMAIN"],
    cookieSecure: process.env["COOKIE_SECURE"],

    googleOauthClientId: process.env["GOOGLE_OAUTH_CLIENT_ID"],
    googleOauthClientSecret: process.env["GOOGLE_OAUTH_CLIENT_SECRET"],
    googleOauthRedirectUri: process.env["GOOGLE_OAUTH_REDIRECT_URI"],

    hibpUserAgent: process.env["HIBP_USER_AGENT"],

    webAppOrigin: process.env["WEB_APP_ORIGIN"],
    adminAppOrigin: process.env["ADMIN_APP_ORIGIN"],
  });
}

export const SERVICE_NAME = "identity";
