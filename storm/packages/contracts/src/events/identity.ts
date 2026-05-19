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
  UserEmailChangeRequested: "User.EmailChangeRequested.v1",
  UserEmailChanged: "User.EmailChanged.v1",
  UserMobileChangeRequested: "User.MobileChangeRequested.v1",
  UserMobileChanged: "User.MobileChanged.v1",
  UserDeleted: "User.Deleted.v1",
  UserAddressAdded: "User.AddressAdded.v1",
  UserAddressUpdated: "User.AddressUpdated.v1",
  UserAddressDeleted: "User.AddressDeleted.v1",
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
  email: z.string().email(),
  name: z.string(),
  reason: z.string().optional(),
});

export const UserUnblockedPayload = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
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

export const UserEmailChangeRequestedPayload = z.object({
  userId: z.string().uuid(),
  oldEmail: z.string().email(),
  newEmail: z.string().email(),
  name: z.string(),
  verificationToken: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const UserEmailChangedPayload = z.object({
  userId: z.string().uuid(),
  oldEmail: z.string().email(),
  newEmail: z.string().email(),
  name: z.string(),
});

export const UserMobileChangeRequestedPayload = z.object({
  userId: z.string().uuid(),
  oldMobile: z.string().nullable(),
  newMobile: z.string().min(1),
  otp: z.string().regex(/^\d{6}$/),
  expiresAt: z.string().datetime(),
});

export const UserMobileChangedPayload = z.object({
  userId: z.string().uuid(),
  oldMobile: z.string().nullable(),
  newMobile: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export const UserDeletedPayload = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  deletedAt: z.string().datetime(),
});

export const AddressEventPayload = z.object({
  userId: z.string().uuid(),
  addressId: z.string().uuid(),
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
export type UserEmailChangeRequested = z.infer<typeof UserEmailChangeRequestedPayload>;
export type UserEmailChanged = z.infer<typeof UserEmailChangedPayload>;
export type UserMobileChangeRequested = z.infer<typeof UserMobileChangeRequestedPayload>;
export type UserMobileChanged = z.infer<typeof UserMobileChangedPayload>;
export type UserDeleted = z.infer<typeof UserDeletedPayload>;
export type AddressEvent = z.infer<typeof AddressEventPayload>;
