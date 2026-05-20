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
      "<p>Hi {{name}},</p><p>Your Storm account has been blocked.{{#if reason}} Reason: {{reason}}.{{/if}} Contact support if you think this is a mistake.</p>",
    textBody:
      "Hi {{name}},\n\nYour Storm account has been blocked.{{#if reason}} Reason: {{reason}}.{{/if}} Contact support if you think this is a mistake.",
    version: 2,
  },
  {
    _id: "account-unblocked",
    channel: "email",
    locale: "en-IN",
    subject: "Your Storm account has been reinstated",
    htmlBody:
      "<p>Hi {{name}},</p><p>Your Storm account has been unblocked. Please sign in again to continue.</p>",
    textBody:
      "Hi {{name}},\n\nYour Storm account has been unblocked. Please sign in again to continue.",
    version: 1,
  },
  {
    _id: "email-change-verification",
    channel: "email",
    locale: "en-IN",
    subject: "Confirm your new Storm email",
    htmlBody:
      "<p>Hi {{name}},</p><p>Confirm the change of your Storm email to <strong>{{newEmail}}</strong> by clicking <a href=\"{{verifyUrl}}\">this link</a>. It expires on {{expiresAt}}.</p>",
    textBody:
      "Hi {{name}},\n\nConfirm the change of your Storm email to {{newEmail}}:\n{{verifyUrl}}\nExpires: {{expiresAt}}",
    version: 1,
  },
  {
    _id: "email-changed",
    channel: "email",
    locale: "en-IN",
    subject: "Your Storm email was changed",
    htmlBody:
      "<p>Hi {{name}},</p><p>Your Storm account email was changed from {{oldEmail}} to {{newEmail}}. If this wasn't you, contact support immediately.</p>",
    textBody:
      "Hi {{name}},\n\nYour Storm account email was changed from {{oldEmail}} to {{newEmail}}.\nIf this wasn't you, contact support immediately.",
    version: 1,
  },
  {
    _id: "mobile-change-otp",
    channel: "sms",
    locale: "en-IN",
    smsBody: "Your Storm verification OTP is {{otp}}. Valid for 5 minutes. Do not share it.",
    version: 1,
  },
  {
    _id: "mobile-changed",
    channel: "email",
    locale: "en-IN",
    subject: "Your Storm mobile number was changed",
    htmlBody:
      "<p>Hi {{name}},</p><p>Your Storm mobile was updated to {{newMobile}}. If this wasn't you, contact support immediately.</p>",
    textBody:
      "Hi {{name}},\n\nYour Storm mobile was updated to {{newMobile}}.\nIf this wasn't you, contact support immediately.",
    version: 1,
  },
  {
    _id: "account-deleted",
    channel: "email",
    locale: "en-IN",
    subject: "Your Storm account has been deleted",
    htmlBody:
      "<p>Hi {{name}},</p><p>Your Storm account was deleted on {{deletedAt}}. We're sorry to see you go.</p>",
    textBody:
      "Hi {{name}},\n\nYour Storm account was deleted on {{deletedAt}}. We're sorry to see you go.",
    version: 1,
  },
  {
    _id: "order-confirmed",
    channel: "email",
    locale: "en-IN",
    subject: "Order #{{orderId}} confirmed — your Storm invoice is attached",
    htmlBody:
      "<p>Hi {{customerName}},</p><p>Thanks for shopping with Storm. Your order <strong>#{{orderId}}</strong> has been confirmed.</p><p><strong>Order total:</strong> ₹{{totalRupees}}<br/><strong>Items:</strong> {{itemsCount}}<br/><strong>Confirmed at (IST):</strong> {{paidAtIst}}</p><p>Your invoice is attached as a PDF. We'll let you know when your order ships.</p><p>— Team Storm</p>",
    textBody:
      "Hi {{customerName}},\n\nThanks for shopping with Storm. Your order #{{orderId}} has been confirmed.\n\nOrder total: ₹{{totalRupees}}\nItems: {{itemsCount}}\nConfirmed at (IST): {{paidAtIst}}\n\nYour invoice is attached as a PDF. We'll let you know when your order ships.\n\n— Team Storm",
    version: 1,
  },
  {
    _id: "order-confirmed-sms",
    channel: "sms",
    locale: "en-IN",
    smsBody:
      "Storm: Order #{{orderShort}} confirmed. Total ₹{{totalRupees}}. Thanks for shopping with us!",
    version: 1,
  },
  {
    _id: "order-failed",
    channel: "email",
    locale: "en-IN",
    subject: "Order #{{orderId}} could not be completed",
    htmlBody:
      "<p>Hi {{customerName}},</p><p>We weren't able to complete payment for your order <strong>#{{orderId}}</strong>.</p><p>Reason: {{reason}}.</p><p>No amount has been debited. You can try again from your cart.</p><p>— Team Storm</p>",
    textBody:
      "Hi {{customerName}},\n\nWe weren't able to complete payment for your order #{{orderId}}.\n\nReason: {{reason}}\n\nNo amount has been debited. You can try again from your cart.\n\n— Team Storm",
    version: 1,
  },
  {
    _id: "order-failed-sms",
    channel: "sms",
    locale: "en-IN",
    smsBody:
      "Storm: Payment for order #{{orderShort}} did not go through. You can retry from your cart.",
    version: 1,
  },
  {
    _id: "order-status-processing",
    channel: "email",
    locale: "en-IN",
    subject: "Order #{{orderId}} — we're preparing your order",
    htmlBody:
      "<p>Hi {{customerName}},</p><p>Good news — we're preparing order <strong>#{{orderId}}</strong>. We'll let you know the moment it ships.</p><p>— Team Storm</p>",
    textBody:
      "Hi {{customerName}},\n\nGood news — we're preparing order #{{orderId}}. We'll let you know the moment it ships.\n\n— Team Storm",
    version: 1,
  },
  {
    _id: "order-status-processing-sms",
    channel: "sms",
    locale: "en-IN",
    smsBody: "Storm: Order #{{orderShort}} is being prepared. We'll update you when it ships.",
    version: 1,
  },
  {
    _id: "order-status-shipped",
    channel: "email",
    locale: "en-IN",
    subject: "Order #{{orderId}} is on the way",
    htmlBody:
      "<p>Hi {{customerName}},</p><p>Your order <strong>#{{orderId}}</strong> has shipped and is on its way.</p><p>— Team Storm</p>",
    textBody:
      "Hi {{customerName}},\n\nYour order #{{orderId}} has shipped and is on its way.\n\n— Team Storm",
    version: 1,
  },
  {
    _id: "order-status-shipped-sms",
    channel: "sms",
    locale: "en-IN",
    smsBody: "Storm: Order #{{orderShort}} has shipped. It's on the way.",
    version: 1,
  },
  {
    _id: "order-status-delivered",
    channel: "email",
    locale: "en-IN",
    subject: "Order #{{orderId}} delivered",
    htmlBody:
      "<p>Hi {{customerName}},</p><p>Your order <strong>#{{orderId}}</strong> has been delivered. Thanks for shopping with Storm.</p><p>— Team Storm</p>",
    textBody:
      "Hi {{customerName}},\n\nYour order #{{orderId}} has been delivered. Thanks for shopping with Storm.\n\n— Team Storm",
    version: 1,
  },
  {
    _id: "order-status-delivered-sms",
    channel: "sms",
    locale: "en-IN",
    smsBody: "Storm: Order #{{orderShort}} delivered. Thanks for shopping with us!",
    version: 1,
  },
  {
    _id: "order-cancelled-by-customer",
    channel: "email",
    locale: "en-IN",
    subject: "Order #{{orderId}} cancellation confirmed",
    htmlBody:
      "<p>Hi {{customerName}},</p><p>We've cancelled your order <strong>#{{orderId}}</strong> as requested. Any payment authorisation will be released shortly.</p><p>— Team Storm</p>",
    textBody:
      "Hi {{customerName}},\n\nWe've cancelled your order #{{orderId}} as requested. Any payment authorisation will be released shortly.\n\n— Team Storm",
    version: 1,
  },
  {
    _id: "order-cancelled-by-customer-sms",
    channel: "sms",
    locale: "en-IN",
    smsBody: "Storm: Your order #{{orderShort}} has been cancelled.",
    version: 1,
  },
  {
    _id: "order-cancelled-by-admin",
    channel: "email",
    locale: "en-IN",
    subject: "Order #{{orderId}} cancelled",
    htmlBody:
      "<p>Hi {{customerName}},</p><p>We're sorry — your order <strong>#{{orderId}}</strong> was cancelled.{{#if reason}} Reason: {{reason}}.{{/if}} Any payment will be refunded to the original method.</p><p>— Team Storm</p>",
    textBody:
      "Hi {{customerName}},\n\nWe're sorry — your order #{{orderId}} was cancelled.{{#if reason}} Reason: {{reason}}.{{/if}} Any payment will be refunded to the original method.\n\n— Team Storm",
    version: 1,
  },
  {
    _id: "order-cancelled-by-admin-sms",
    channel: "sms",
    locale: "en-IN",
    smsBody: "Storm: Order #{{orderShort}} was cancelled. Check email for details.",
    version: 1,
  },
];
