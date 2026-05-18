import type { Logger } from "@storm/logger";
import {
  IdentityEventTypes,
  UserCreatedPayload,
  UserEmailVerificationRequestedPayload,
  UserNewDeviceLoginPayload,
  UserOtpRequestedPayload,
  UserPasswordChangedPayload,
  UserPasswordResetRequestedPayload,
  UserBlockedPayload,
} from "@storm/contracts";

import type { Config } from "../config.js";
import type { MongoState } from "../infra/mongo.js";
import type { EmailProvider } from "../providers/email.js";
import type { SmsProvider } from "../providers/sms.js";
import { renderEmail, renderSms } from "../templates/render.js";

export interface HandlerDeps {
  mongo: MongoState;
  email: EmailProvider;
  sms: SmsProvider;
  config: Config;
  logger: Logger;
}

export interface HandledEnvelope {
  eventId: string;
  eventType: string;
  payload: unknown;
}

export type EventHandler = (env: HandledEnvelope, deps: HandlerDeps) => Promise<void>;

export const eventHandlers: Record<string, EventHandler> = {
  [IdentityEventTypes.UserCreated]: async (env, deps) => {
    const payload = UserCreatedPayload.parse(env.payload);
    const tpl = await renderEmail(deps.mongo.templates, "welcome", { name: payload.name });
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(deps, env, payload.userId, "email", "welcome", payload, result);
  },

  [IdentityEventTypes.UserEmailVerificationRequested]: async (env, deps) => {
    const payload = UserEmailVerificationRequestedPayload.parse(env.payload);
    const verifyUrl = `${deps.config.webAppOrigin}/auth/verify-email?token=${encodeURIComponent(
      payload.verificationToken,
    )}`;
    const tpl = await renderEmail(deps.mongo.templates, "email-verification", {
      name: payload.name,
      verifyUrl,
      expiresAt: payload.expiresAt,
    });
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(
      deps,
      env,
      payload.userId,
      "email",
      "email-verification",
      { email: payload.email, name: payload.name },
      result,
    );
  },

  [IdentityEventTypes.UserPasswordResetRequested]: async (env, deps) => {
    const payload = UserPasswordResetRequestedPayload.parse(env.payload);
    const resetUrl = `${deps.config.webAppOrigin}/auth/reset-password?token=${encodeURIComponent(
      payload.resetToken,
    )}`;
    const tpl = await renderEmail(deps.mongo.templates, "password-reset", {
      name: payload.name,
      resetUrl,
      expiresAt: payload.expiresAt,
    });
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(
      deps,
      env,
      payload.userId,
      "email",
      "password-reset",
      { email: payload.email, name: payload.name },
      result,
    );
  },

  [IdentityEventTypes.UserPasswordChanged]: async (env, deps) => {
    const payload = UserPasswordChangedPayload.parse(env.payload);
    const tpl = await renderEmail(deps.mongo.templates, "password-changed", {});
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(deps, env, payload.userId, "email", "password-changed", payload, result);
  },

  [IdentityEventTypes.UserNewDeviceLogin]: async (env, deps) => {
    const payload = UserNewDeviceLoginPayload.parse(env.payload);
    const tpl = await renderEmail(deps.mongo.templates, "new-device-login", {
      name: payload.name,
      ip: payload.ip ?? "unknown",
      userAgent: payload.userAgent ?? "unknown",
      occurredAt: payload.occurredAt,
    });
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(deps, env, payload.userId, "email", "new-device-login", payload, result);
  },

  [IdentityEventTypes.UserOtpRequested]: async (env, deps) => {
    const payload = UserOtpRequestedPayload.parse(env.payload);
    const tpl = await renderSms(deps.mongo.templates, "otp", { otp: payload.otp });
    const result = await deps.sms.send({ to: payload.mobile, body: tpl.body });
    await logSend(
      deps,
      env,
      payload.userId,
      "sms",
      "otp",
      { mobile: payload.mobile },
      result,
    );
  },

  [IdentityEventTypes.UserBlocked]: async (env, deps) => {
    const payload = UserBlockedPayload.parse(env.payload);
    // We don't have the user's email here yet (Day 3 will add it to the event);
    // for now, log and skip. notification log still records the attempt.
    deps.logger.warn(
      { eventId: env.eventId, userId: payload.userId },
      "user_blocked_email_skipped_missing_email_payload",
    );
  },
};

async function logSend(
  deps: HandlerDeps,
  env: HandledEnvelope,
  userId: string,
  channel: "email" | "sms",
  templateId: string,
  payload: Record<string, unknown>,
  providerResponse: unknown,
): Promise<void> {
  await deps.mongo.logs.updateOne(
    { eventId: env.eventId },
    {
      $set: {
        eventId: env.eventId,
        userId,
        channel,
        templateId,
        templateVersion: 1,
        payload,
        status: "sent",
        providerResponse,
        sentAt: new Date(),
      },
      $inc: { attempts: 1 },
    },
    { upsert: true },
  );
}
