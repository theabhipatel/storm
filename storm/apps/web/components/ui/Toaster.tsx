"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { subscribeToasts, dismissToast, type Toast } from "../../lib/toast";

const VARIANT_STYLES: Record<NonNullable<Toast["variant"]>, string> = {
  default: "border-border bg-surface text-text",
  success: "border-success/30 bg-success-soft text-text",
  error: "border-danger/30 bg-danger-soft text-text",
  warning: "border-warning/30 bg-warning-soft text-text",
};

const VARIANT_ACCENT: Record<NonNullable<Toast["variant"]>, string> = {
  default: "bg-primary",
  success: "bg-success",
  error: "bg-danger",
  warning: "bg-warning",
};

function VariantIcon({ variant }: { variant: NonNullable<Toast["variant"]> }) {
  const cls = "h-5 w-5";
  switch (variant) {
    case "success":
      return <CheckCircle2 className={`${cls} text-success`} />;
    case "error":
      return <XCircle className={`${cls} text-danger`} />;
    case "warning":
      return <AlertTriangle className={`${cls} text-warning`} />;
    default:
      return <Info className={`${cls} text-primary`} />;
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-20 right-4 z-50 flex w-full max-w-sm flex-col gap-2 md:bottom-4"
    >
      {toasts.map((t) => {
        const variant = t.variant ?? "default";
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border px-3 py-3 pl-4 text-sm shadow-elevated ${VARIANT_STYLES[variant]}`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 w-1 ${VARIANT_ACCENT[variant]}`}
            />
            <VariantIcon variant={variant} />
            <span className="flex-1 pt-0.5">{t.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="-mr-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-text-subtle hover:bg-surface-muted hover:text-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
