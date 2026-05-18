import type { TemplateRow } from "../infra/mongo.js";

// Plaintext / minimal-HTML templates. Curly placeholders are rendered by Handlebars.
// Bumping a template's content -> bump `version`.
export const TEMPLATE_SEED: ReadonlyArray<Omit<TemplateRow, "createdAt">> = [
  {
    _id: "welcome",
    channel: "email",
    locale: "en-IN",
    subject: "Welcome to Storm, {{name}}!",
    htmlBody:
      "<p>Hi {{name}},</p><p>Welcome to Storm. We're glad you're here.</p>",
    textBody: "Hi {{name}},\n\nWelcome to Storm. We're glad you're here.",
    version: 1,
  },
  {
    _id: "email-verification",
    channel: "email",
    locale: "en-IN",
    subject: "Verify your Storm email",
    htmlBody:
      "<p>Hi {{name}},</p><p>Confirm your email by clicking <a href=\"{{verifyUrl}}\">this link</a>. It expires on {{expiresAt}}.</p>",
    textBody:
      "Hi {{name}},\n\nConfirm your email: {{verifyUrl}}\nExpires: {{expiresAt}}",
    version: 1,
  },
  {
    _id: "password-reset",
    channel: "email",
    locale: "en-IN",
    subject: "Reset your Storm password",
    htmlBody:
      "<p>Hi {{name}},</p><p>Reset your password using <a href=\"{{resetUrl}}\">this link</a>. It expires on {{expiresAt}}. If you didn't request this, ignore this email.</p>",
    textBody:
      "Hi {{name}},\n\nReset your password: {{resetUrl}}\nExpires: {{expiresAt}}\n\nIf you didn't request this, ignore this email.",
    version: 1,
  },
  {
    _id: "password-changed",
    channel: "email",
    locale: "en-IN",
    subject: "Your Storm password was changed",
    htmlBody:
      "<p>Hi,</p><p>Your Storm password was just changed. If this wasn't you, contact support immediately.</p>",
    textBody:
      "Hi,\n\nYour Storm password was just changed. If this wasn't you, contact support immediately.",
    version: 1,
  },
  {
    _id: "new-device-login",
    channel: "email",
    locale: "en-IN",
    subject: "New sign-in to your Storm account",
    htmlBody:
      "<p>Hi {{name}},</p><p>We noticed a sign-in from a new device.</p><ul><li>IP: {{ip}}</li><li>Device: {{userAgent}}</li><li>Time: {{occurredAt}}</li></ul><p>If that wasn't you, reset your password right away.</p>",
    textBody:
      "Hi {{name}},\n\nNew sign-in from a new device.\nIP: {{ip}}\nDevice: {{userAgent}}\nTime: {{occurredAt}}\n\nIf that wasn't you, reset your password right away.",
    version: 1,
  },
  {
    _id: "otp",
    channel: "sms",
    locale: "en-IN",
    smsBody: "Your Storm OTP is {{otp}}. Valid for 5 minutes. Do not share it.",
    version: 1,
  },
  {
    _id: "account-blocked",
    channel: "email",
    locale: "en-IN",
    subject: "Your Storm account has been blocked",
    htmlBody:
      "<p>Hi,</p><p>Your Storm account has been blocked.{{#if reason}} Reason: {{reason}}.{{/if}} Contact support if you think this is a mistake.</p>",
    textBody:
      "Hi,\n\nYour Storm account has been blocked.{{#if reason}} Reason: {{reason}}.{{/if}} Contact support if you think this is a mistake.",
    version: 1,
  },
];
