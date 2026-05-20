import { z } from "zod";

export const INDIA_PHONE_REGEX = /^[6-9]\d{9}$/;
export const INDIA_PINCODE_REGEX = /^[1-9]\d{5}$/;

export const indiaPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+?91/, ""))
  .pipe(
    z
      .string()
      .regex(INDIA_PHONE_REGEX, "Enter a 10-digit Indian mobile starting with 6-9"),
  );

export const indiaPincodeSchema = z
  .string()
  .trim()
  .regex(INDIA_PINCODE_REGEX, "Enter a 6-digit Indian pincode");

export function isValidIndiaPhone(value: string): boolean {
  return INDIA_PHONE_REGEX.test(normalizeIndiaPhone(value));
}

export function isValidIndiaPincode(value: string): boolean {
  return INDIA_PINCODE_REGEX.test(value.trim());
}

export function normalizeIndiaPhone(value: string): string {
  return value.trim().replace(/[\s-]/g, "").replace(/^\+?91/, "");
}

export function formatIndiaPhone(value: string): string {
  const normalized = normalizeIndiaPhone(value);
  if (!INDIA_PHONE_REGEX.test(normalized)) return value;
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}
