"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { AuthShell } from "../../../../components/domain/AuthShell";
import { useConfirmEmailChangeMutation } from "../../../../features/account/account.api";

export default function ConfirmEmailChangePage() {
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
        <p className="text-sm text-red-700">Missing confirmation token.</p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-600">Confirming…</p>
      ) : isSuccess ? (
        <p className="text-sm text-emerald-700">
          Email updated. You&apos;ve been signed out everywhere — please sign in with your
          new email.
        </p>
      ) : error ? (
        <p className="text-sm text-red-700">
          {(error as { code?: string }).code === "TOKEN_INVALID"
            ? "This link is invalid or expired."
            : (error as { message?: string }).message ?? "Could not confirm."}
        </p>
      ) : null}
    </AuthShell>
  );
}
