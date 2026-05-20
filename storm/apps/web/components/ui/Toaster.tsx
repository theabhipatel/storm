"use client";

import { useEffect, useState } from "react";

import { subscribeToasts, dismissToast, type Toast } from "../../lib/toast";

const VARIANT_STYLES: Record<NonNullable<Toast["variant"]>, string> = {
  default: "border-neutral-200 bg-white text-neutral-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          role="status"
          className={`pointer-events-auto flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm shadow-sm transition ${
            VARIANT_STYLES[t.variant ?? "default"]
          }`}
        >
          <span className="flex-1">{t.message}</span>
          <span aria-hidden="true" className="text-xs text-neutral-400">✕</span>
        </button>
      ))}
    </div>
  );
}
