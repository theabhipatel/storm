import { useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">Block user</h2>
        <p className="mt-1 text-sm text-neutral-600">
          {userEmail} will be signed out of all sessions and denied login.
        </p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-neutral-800">Reason</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            placeholder="Required for the audit log"
          />
        </label>
        {error ? (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message ?? "Could not block user."}
          </div>
        ) : null}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading || reason.trim().length === 0}
            onClick={() => onConfirm(reason.trim())}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Blocking…" : "Block user"}
          </button>
        </div>
      </div>
    </div>
  );
}
