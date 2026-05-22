"use client";

import { Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { AuthShell } from "../../../../../components/domain/AuthShell";
import { useLazyMe, useRefresh } from "../../../../../features/auth/auth.hooks";

function GoogleCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [refresh] = useRefresh();
  const [fetchMe] = useLazyMe();
  const ok = params.get("ok") === "1";

  useEffect(() => {
    if (!ok) return;
    (async () => {
      try {
        await refresh().unwrap();
        await fetchMe().unwrap();
        router.push("/");
      } catch {
        router.push("/auth/login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok]);

  if (!ok) {
    return (
      <AuthShell title="Sign-in failed">
        <div className="flex items-start gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>Google sign-in didn&apos;t complete. Try again from the login page.</p>
        </div>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Back to login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Signing you in…">
      <p className="inline-flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Hang tight, redirecting…
      </p>
    </AuthShell>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<AuthShell title="Loading...">&nbsp;</AuthShell>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
