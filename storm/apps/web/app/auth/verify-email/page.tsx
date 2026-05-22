"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { AuthShell } from "../../../components/domain/AuthShell";
import { useVerifyEmail } from "../../../features/auth/auth.hooks";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [verify, { isLoading, isSuccess, error }] = useVerifyEmail();

  useEffect(() => {
    if (token) void verify({ token });
  }, [token, verify]);

  if (!token) {
    return (
      <AuthShell title="Missing token">
        <div className="flex items-start gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            This link is incomplete. Request a new verification email from your account.
          </p>
        </div>
      </AuthShell>
    );
  }
  if (isSuccess) {
    return (
      <AuthShell title="Email verified">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-sm text-text-muted">Your account is active. You can log in now.</p>
          <Link
            href="/auth/login"
            className="mt-2 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Continue to login
          </Link>
        </div>
      </AuthShell>
    );
  }
  if (error) {
    return (
      <AuthShell title="Link invalid or expired">
        <div className="flex items-start gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>Request a new verification link from your account, or contact support.</p>
        </div>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Verifying your email…">
      <p className="inline-flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        {isLoading ? "Hang tight…" : "Starting…"}
      </p>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthShell title="Loading...">&nbsp;</AuthShell>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
