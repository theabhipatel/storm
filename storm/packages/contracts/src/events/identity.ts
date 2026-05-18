import { z } from "zod";

export const IdentityEventTypes = {
  UserCreated: "User.Created.v1",
  UserBlocked: "User.Blocked.v1",
  UserUnblocked: "User.Unblocked.v1",
  UserPasswordChanged: "User.PasswordChanged.v1",
  UserOtpRequested: "User.OtpRequested.v1",
  UserEmailVerificationRequested: "User.EmailVerificationRequested.v1",
  UserPasswordResetRequested: "User.PasswordResetRequested.v1",
  UserNewDeviceLogin: "User.NewDeviceLogin.v1",
} as const;

export type IdentityEventType =
  (typeof IdentityEventTypes)[keyof typeof IdentityEventTypes];

export const UserCreatedPayload = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["customer", "admin"]),
});

export const UserBlockedPayload = z.object({
  userId: z.string().uuid(),
  reason: z.string().optional(),
});

export const UserUnblockedPayload = z.object({
  userId: z.string().uuid(),
});

export const UserPasswordChangedPayload = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
});

export const UserEmailVerificationRequestedPayload = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  verificationToken: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const UserPasswordResetRequestedPayload = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  resetToken: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const UserOtpRequestedPayload = z.object({
  userId: z.string().uuid(),
  mobile: z.string().min(1),
  otp: z.string().regex(/^\d{6}$/),
  expiresAt: z.string().datetime(),
});

export const UserNewDeviceLoginPayload = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  occurredAt: z.string().datetime(),
});

export type UserCreated = z.infer<typeof UserCreatedPayload>;
export type UserBlocked = z.infer<typeof UserBlockedPayload>;
export type UserUnblocked = z.infer<typeof UserUnblockedPayload>;
export type UserPasswordChanged = z.infer<typeof UserPasswordChangedPayload>;
export type UserEmailVerificationRequested = z.infer<
  typeof UserEmailVerificationRequestedPayload
>;
export type UserPasswordResetRequested = z.infer<typeof UserPasswordResetRequestedPayload>;
export type UserOtpRequested = z.infer<typeof UserOtpRequestedPayload>;
export type UserNewDeviceLogin = z.infer<typeof UserNewDeviceLoginPayload>;
