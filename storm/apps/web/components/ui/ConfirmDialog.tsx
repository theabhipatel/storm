"use client";

import type { ReactNode } from "react";

import { Button } from "./Field";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  disabled,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {message ? <p className="mt-2 text-sm text-neutral-600">{message}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className={
              "w-full rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed " +
              (variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-neutral-900 text-white hover:bg-neutral-800")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
