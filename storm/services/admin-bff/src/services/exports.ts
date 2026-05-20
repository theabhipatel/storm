import { randomUUID } from "node:crypto";

import { fetchJson, forwardHeaders } from "./proxy.js";

export type ExportKind = "orders" | "users";

export interface ExportRecord {
  id: string;
  kind: ExportKind;
  status: "queued" | "running" | "ready" | "failed";
  createdAt: string;
  completedAt?: string;
  filename: string;
  rowCount?: number;
  errorMessage?: string;
  body?: Buffer;
}

const exportsStore = new Map<string, ExportRecord>();

export function getExport(id: string): ExportRecord | undefined {
  return exportsStore.get(id);
}

export function listExports(limit = 25): ExportRecord[] {
  return Array.from(exportsStore.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(values: unknown[]): string {
  return values.map(escapeCsv).join(",");
}

interface OrderRow {
  id: string;
  status: string;
  totalPaise: number;
  currency: string;
  itemsCount: number;
  customerEmail?: string | null;
  createdAt: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  blocked?: boolean;
  createdAt: string;
}

export interface ExportRequest {
  kind: ExportKind;
  filters: Record<string, string>;
  upstreamBaseUrl: string;
  upstreamPath: string;
  forward: ReturnType<typeof forwardHeaders>;
}

export async function startExport(args: {
  kind: ExportKind;
  filters: Record<string, string>;
  upstreamBaseUrl: string;
  upstreamPath: string;
  req: Parameters<typeof fetchJson>[0]["req"];
}): Promise<ExportRecord> {
  const id = randomUUID();
  const now = new Date().toISOString();
  const record: ExportRecord = {
    id,
    kind: args.kind,
    status: "queued",
    createdAt: now,
    filename: `${args.kind}-${id.slice(0, 8)}.csv`,
  };
  exportsStore.set(id, record);

  // Stage 1: run synchronously in the background. Real implementation would
  // emit a Kafka event, run on a worker, upload to S3, then email link.
  void runExport(record, args);
  return record;
}

async function runExport(
  record: ExportRecord,
  args: {
    upstreamBaseUrl: string;
    upstreamPath: string;
    filters: Record<string, string>;
    req: Parameters<typeof fetchJson>[0]["req"];
  },
): Promise<void> {
  record.status = "running";
  try {
    const rows: string[] = [];
    if (record.kind === "orders") {
      rows.push(csvRow(["orderId", "status", "totalPaise", "currency", "itemsCount", "customerEmail", "createdAt"]));
      await iteratePages<OrderRow>({
        baseUrl: args.upstreamBaseUrl,
        path: args.upstreamPath,
        filters: args.filters,
        req: args.req,
        onItems: (items) => {
          for (const o of items) {
            rows.push(
              csvRow([o.id, o.status, o.totalPaise, o.currency, o.itemsCount, o.customerEmail, o.createdAt]),
            );
          }
        },
      });
    } else {
      rows.push(csvRow(["userId", "email", "name", "role", "blocked", "createdAt"]));
      await iteratePages<UserRow>({
        baseUrl: args.upstreamBaseUrl,
        path: args.upstreamPath,
        filters: args.filters,
        req: args.req,
        onItems: (items) => {
          for (const u of items) {
            rows.push(
              csvRow([u.id, u.email, u.name, u.role, u.blocked ?? false, u.createdAt]),
            );
          }
        },
      });
    }

    record.body = Buffer.from(rows.join("\n"), "utf8");
    record.rowCount = rows.length - 1;
    record.status = "ready";
    record.completedAt = new Date().toISOString();
  } catch (err) {
    record.status = "failed";
    record.errorMessage = err instanceof Error ? err.message : "Unknown error";
    record.completedAt = new Date().toISOString();
  }
}

async function iteratePages<T>(args: {
  baseUrl: string;
  path: string;
  filters: Record<string, string>;
  req: Parameters<typeof fetchJson>[0]["req"];
  onItems: (items: T[]) => void;
}): Promise<void> {
  let cursor: string | undefined;
  const limit = 100;
  for (let i = 0; i < 100; i++) {
    const params = new URLSearchParams({ ...args.filters, limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    const url = `${args.baseUrl}${args.path}?${params.toString()}`;
    const upstream = await fetch(url, { headers: forwardHeaders(args.req) });
    if (!upstream.ok) {
      throw new Error(`upstream ${upstream.status}`);
    }
    const body = (await upstream.json()) as { items: T[]; nextCursor?: string | null };
    args.onItems(body.items ?? []);
    if (!body.nextCursor) return;
    cursor = body.nextCursor;
  }
}
