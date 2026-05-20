import { test as base, expect } from "@playwright/test";

export interface TestUser {
  email: string;
  password: string;
  name: string;
  mobile: string;
}

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function makeCustomer(): TestUser {
  const id = uniqueSuffix();
  return {
    email: `e2e+${id}@storm.example`,
    password: "TestPass1!",
    name: `E2E User ${id}`,
    mobile: `9${String(Math.floor(100000000 + Math.random() * 900000000))}`,
  };
}

const MAILHOG_URL = process.env["MAILHOG_URL"] ?? "http://localhost:8025";

interface MailhogMessage {
  ID: string;
  Content: { Body: string; Headers: Record<string, string[]> };
}

export async function readMailhogFor(email: string): Promise<MailhogMessage | null> {
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${MAILHOG_URL}/api/v2/search?kind=to&query=${encodeURIComponent(email)}`);
    if (res.ok) {
      const body = (await res.json()) as { items: MailhogMessage[] };
      if (body.items.length > 0) return body.items[0]!;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

export function extractVerificationToken(body: string): string | null {
  const match = body.match(/verify-email\?token=([A-Za-z0-9_-]+)/);
  return match ? match[1]! : null;
}

export const test = base.extend({});
export { expect };
