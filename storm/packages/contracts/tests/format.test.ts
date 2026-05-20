import { describe, it, expect } from "vitest";
import {
  formatINR,
  formatINRCompact,
  formatDateIST,
  isValidIndiaPhone,
  isValidIndiaPincode,
  normalizeIndiaPhone,
  formatIndiaPhone,
  indiaPhoneSchema,
  indiaPincodeSchema,
} from "../src/format/index.js";

describe("formatINR", () => {
  it("renders Indian numbering for lakhs", () => {
    expect(formatINR(10_000_000)).toMatch(/1,00,000\.00/);
  });
  it("renders paise correctly", () => {
    expect(formatINR(12345)).toMatch(/123\.45/);
  });
});

describe("formatINRCompact", () => {
  it("uses Cr above one crore rupees", () => {
    expect(formatINRCompact(150_000_000_00)).toContain("Cr");
  });
  it("uses L above one lakh rupees", () => {
    expect(formatINRCompact(2_000_000_00)).toContain("L");
  });
  it("uses full format below one lakh", () => {
    expect(formatINRCompact(500_000)).not.toMatch(/L|Cr/);
  });
});

describe("formatDateIST", () => {
  it("appends IST suffix", () => {
    const out = formatDateIST("2026-05-28T10:15:00Z");
    expect(out).toContain("IST");
    expect(out).toContain("2026");
  });
});

describe("phone validation", () => {
  it.each(["9876543210", "+919876543210", "+91 98765 43210", "919876543210"])(
    "accepts %s",
    (v) => expect(isValidIndiaPhone(v)).toBe(true),
  );
  it.each(["1234567890", "5876543210", "98765"])("rejects %s", (v) =>
    expect(isValidIndiaPhone(v)).toBe(false),
  );
  it("normalises to 10 digits", () => {
    expect(normalizeIndiaPhone("+91 98765 43210")).toBe("9876543210");
  });
  it("formats valid number", () => {
    expect(formatIndiaPhone("9876543210")).toBe("+91 98765 43210");
  });
  it("zod schema parses", () => {
    expect(indiaPhoneSchema.parse("+91-98765-43210")).toBe("9876543210");
  });
});

describe("pincode validation", () => {
  it.each(["110001", "560034", "400001"])("accepts %s", (v) =>
    expect(isValidIndiaPincode(v)).toBe(true),
  );
  it.each(["012345", "12345", "1234567"])("rejects %s", (v) =>
    expect(isValidIndiaPincode(v)).toBe(false),
  );
  it("zod pincode passes", () => {
    expect(indiaPincodeSchema.parse(" 110001 ")).toBe("110001");
  });
});
