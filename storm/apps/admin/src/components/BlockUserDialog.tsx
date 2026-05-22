import { Ban, X } from "lucide-react";
import { useState } from "react";

import { Button } from "./ui/Button";
import { IconButton } from "./ui/IconButton";

export function BlockUserDialog({
  open,
  userEmail,
  isLoading,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  userEmail: string;
  isLoading: boolean;
  error?: { code?: string; message?: string } | undefined;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-elevated">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
              <Ban className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text">Block user</h2>
              <p className="mt-1 text-sm text-text-muted">
                {userEmail} will be signed out of all sessions and denied login.
              </p>
            </div>
          </div>
          <IconButton aria-label="Close" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
        <label className="mt-5 block">
          <span className="text-sm font-medium text-text">Reason</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm transition placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="Required for the audit log"
          />
        </label>
        {error ? (
          <div className="mt-3 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {error.message ?? "Could not block user."}
          </div>
        ) : null}
        <div className="mt-5 flex gap-2">
          <Button variant="outline" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={isLoading || reason.trim().length === 0}
            onClick={() => onConfirm(reason.trim())}
          >
            {isLoading ? "Blocking…" : "Block user"}
          </Button>
        </div>
      </div>
    </div>
  );
}
