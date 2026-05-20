import { useEffect, useRef, useState } from "react";

import { ADMIN_BFF_BASE_URL } from "../lib/serviceApi";
import {
  useStartOrdersExportMutation,
  useStartUsersExportMutation,
  useLazyGetExportStatusQuery,
  type ExportRecord,
} from "../features/exports/exports.api";

interface ExportButtonProps {
  kind: "orders" | "users";
  filters: Record<string, string>;
  label?: string;
}

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60_000;

export function ExportButton({ kind, filters, label }: ExportButtonProps) {
  const [startOrders, startOrdersState] = useStartOrdersExportMutation();
  const [startUsers, startUsersState] = useStartUsersExportMutation();
  const [pollStatus] = useLazyGetExportStatusQuery();
  const [current, setCurrent] = useState<ExportRecord | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const busy = startOrdersState.isLoading || startUsersState.isLoading;

  async function trigger(): Promise<void> {
    setCurrent(null);
    stopRef.current?.();
    const start = kind === "orders" ? startOrders : startUsers;
    const result = await start(filters).unwrap();
    pollUntilReady(result.exportId);
  }

  function pollUntilReady(exportId: string): void {
    const startedAt = Date.now();
    const interval = window.setInterval(async () => {
      try {
        const record = await pollStatus(exportId).unwrap();
        setCurrent(record);
        if (record.status === "ready" || record.status === "failed") {
          stopRef.current?.();
        }
      } catch {
        // ignore transient errors and let timeout fire
      }
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stopRef.current?.();
      }
    }, POLL_INTERVAL_MS);
    stopRef.current = () => window.clearInterval(interval);
  }

  return (
    <div className="flex flex-col items-end gap-2 text-xs">
      <button
        type="button"
        onClick={() => void trigger()}
        disabled={busy}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
      >
        {busy ? "Starting…" : label ?? `Export ${kind} (CSV)`}
      </button>
      {current ? <ExportStatusPill record={current} /> : null}
    </div>
  );
}

function ExportStatusPill({ record }: { record: ExportRecord }) {
  if (record.status === "ready") {
    return (
      <a
        href={`${ADMIN_BFF_BASE_URL}${record.downloadUrl ?? ""}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-900"
      >
        Download {record.filename} ({record.rowCount ?? 0} rows)
      </a>
    );
  }
  if (record.status === "failed") {
    return (
      <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-900">
        Failed: {record.errorMessage ?? "unknown error"}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-700">
      {record.status}…
    </span>
  );
}
