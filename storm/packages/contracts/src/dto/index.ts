/**
 * REST DTO schemas. Shared between FE + BE.
 */
import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ReadyResponseSchema = z.object({
  status: z.literal("ready"),
  checks: z.record(z.string(), z.enum(["ok", "fail"])).optional(),
});
export type ReadyResponse = z.infer<typeof ReadyResponseSchema>;

// --- Profile / address shared schemas --------------------------------------

export const PincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, "Pincode must be 6 digits and start 1-9");

// Indian mobile, stored without the +91 prefix; UI prepends.
export const IndianMobileSchema = z
  .string()
  .regex(/^[6-9][0-9]{9}$/, "Mobile must be 10 digits starting 6-9");

export const NameSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[\p{L}\p{M} .]+$/u, "Name may only contain letters, spaces, and periods");

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const IndianStateSchema = z.enum(INDIAN_STATES);

export const AddressCreateSchema = z.object({
  label: z.string().min(1).max(40),
  fullName: NameSchema,
  mobile: IndianMobileSchema,
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().nullable(),
  landmark: z.string().max(120).optional().nullable(),
  city: z.string().min(2).max(80),
  state: IndianStateSchema,
  pincode: PincodeSchema,
  country: z.literal("IN").default("IN"),
  isDefault: z.boolean().optional().default(false),
});

export const AddressUpdateSchema = AddressCreateSchema.partial();

export const AddressSchema = AddressCreateSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Address = z.infer<typeof AddressSchema>;
export type AddressCreateInput = z.infer<typeof AddressCreateSchema>;
export type AddressUpdateInput = z.infer<typeof AddressUpdateSchema>;
export type IndianState = z.infer<typeof IndianStateSchema>;

export const ProfileUpdateSchema = z.object({
  name: NameSchema,
});
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

export const EmailChangeRequestSchema = z.object({
  newEmail: z.string().email().max(254),
  currentPassword: z.string().min(1).max(256),
});

export const EmailChangeConfirmSchema = z.object({
  token: z.string().min(10),
});

export const MobileChangeRequestSchema = z.object({
  newMobile: IndianMobileSchema,
  currentPassword: z.string().min(1).max(256),
});

export const MobileChangeConfirmSchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
});

export const AccountDeleteSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  confirm: z.literal(true),
});

// --- Admin user management -------------------------------------------------

export const AdminUserListQuerySchema = z.object({
  q: z.string().max(200).optional(),
  role: z.enum(["customer", "admin"]).optional(),
  blocked: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  createdAfter: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const AdminBlockSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const PublicUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  mobile: z.string().nullable(),
  role: z.enum(["customer", "admin"]),
  blocked: z.boolean(),
  emailVerified: z.boolean(),
  mobileVerified: z.boolean(),
  createdAt: z.string().datetime(),
});
export type PublicUser = z.infer<typeof PublicUserSchema>;
