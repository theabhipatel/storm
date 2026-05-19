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
  UserUnblockedPayload,
  UserEmailChangeRequestedPayload,
  UserEmailChangedPayload,
  UserMobileChangeRequestedPayload,
  UserMobileChangedPayload,
  UserDeletedPayload,
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
    const tpl = await renderEmail(deps.mongo.templates, "account-blocked", {
      name: payload.name,
      reason: payload.reason ?? "",
    });
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(deps, env, payload.userId, "email", "account-blocked", payload, result);
  },

  [IdentityEventTypes.UserUnblocked]: async (env, deps) => {
    const payload = UserUnblockedPayload.parse(env.payload);
    const tpl = await renderEmail(deps.mongo.templates, "account-unblocked", {
      name: payload.name,
    });
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(deps, env, payload.userId, "email", "account-unblocked", payload, result);
  },

  [IdentityEventTypes.UserEmailChangeRequested]: async (env, deps) => {
    const payload = UserEmailChangeRequestedPayload.parse(env.payload);
    const verifyUrl = `${deps.config.webAppOrigin}/account/email/confirm?token=${encodeURIComponent(
      payload.verificationToken,
    )}`;
    const tpl = await renderEmail(deps.mongo.templates, "email-change-verification", {
      name: payload.name,
      newEmail: payload.newEmail,
      verifyUrl,
      expiresAt: payload.expiresAt,
    });
    const result = await deps.email.send({ to: payload.newEmail, ...tpl });
    await logSend(
      deps,
      env,
      payload.userId,
      "email",
      "email-change-verification",
      { newEmail: payload.newEmail },
      result,
    );
  },

  [IdentityEventTypes.UserEmailChanged]: async (env, deps) => {
    const payload = UserEmailChangedPayload.parse(env.payload);
    const tpl = await renderEmail(deps.mongo.templates, "email-changed", {
      name: payload.name,
      oldEmail: payload.oldEmail,
      newEmail: payload.newEmail,
    });
    // Notify both the old and new email addresses.
    const [oldResult, newResult] = await Promise.all([
      deps.email.send({ to: payload.oldEmail, ...tpl }),
      deps.email.send({ to: payload.newEmail, ...tpl }),
    ]);
    await logSend(
      deps,
      env,
      payload.userId,
      "email",
      "email-changed",
      payload,
      { old: oldResult, new: newResult },
    );
  },

  [IdentityEventTypes.UserMobileChangeRequested]: async (env, deps) => {
    const payload = UserMobileChangeRequestedPayload.parse(env.payload);
    const tpl = await renderSms(deps.mongo.templates, "mobile-change-otp", {
      otp: payload.otp,
    });
    // SMS provider takes E.164; UI submits 10-digit Indian numbers, so prepend +91.
    const to = payload.newMobile.startsWith("+") ? payload.newMobile : `+91${payload.newMobile}`;
    const result = await deps.sms.send({ to, body: tpl.body });
    await logSend(
      deps,
      env,
      payload.userId,
      "sms",
      "mobile-change-otp",
      { newMobile: payload.newMobile },
      result,
    );
  },

  [IdentityEventTypes.UserMobileChanged]: async (env, deps) => {
    const payload = UserMobileChangedPayload.parse(env.payload);
    const tpl = await renderEmail(deps.mongo.templates, "mobile-changed", {
      name: payload.name,
      newMobile: payload.newMobile,
    });
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(deps, env, payload.userId, "email", "mobile-changed", payload, result);
  },

  [IdentityEventTypes.UserDeleted]: async (env, deps) => {
    const payload = UserDeletedPayload.parse(env.payload);
    const tpl = await renderEmail(deps.mongo.templates, "account-deleted", {
      name: payload.name,
      deletedAt: payload.deletedAt,
    });
    const result = await deps.email.send({ to: payload.email, ...tpl });
    await logSend(deps, env, payload.userId, "email", "account-deleted", payload, result);
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
