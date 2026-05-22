"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { AuthShell } from "../../../../components/domain/AuthShell";
import { useConfirmEmailChangeMutation } from "../../../../features/account/account.api";

export default function ConfirmEmailChangePage() {
  return (
    <Suspense fallback={<AuthShell title="Confirm new email">Loading…</AuthShell>}>
      <ConfirmEmailChangeInner />
    </Suspense>
  );
}

function ConfirmEmailChangeInner() {
  const params = useSearchParams();
  const token = params?.get("token") ?? "";
  const [confirm, { isLoading, isSuccess, error }] = useConfirmEmailChangeMutation();
  const fired = useRef(false);

  useEffect(() => {
    if (!token || fired.current) return;
    fired.current = true;
    confirm({ token });
  }, [token, confirm]);

  return (
    <AuthShell title="Confirm new email">
      {!token ? (
        <div className="flex items-start gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          Missing confirmation token.
        </div>
      ) : isLoading ? (
        <p className="inline-flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirming…
        </p>
      ) : isSuccess ? (
        <p className="inline-flex items-start gap-2 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          Email updated. You&apos;ve been signed out everywhere — please sign in with your
          new email.
        </p>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            {(error as { code?: string }).code === "TOKEN_INVALID"
              ? "This link is invalid or expired."
              : (error as { message?: string }).message ?? "Could not confirm."}
          </span>
        </div>
      ) : null}
    </AuthShell>
  );
}
