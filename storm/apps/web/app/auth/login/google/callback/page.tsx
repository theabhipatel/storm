"use client";

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
        <p className="text-sm text-neutral-600">
          Google sign-in didn&apos;t complete. Try again from the login page.
        </p>
        <a
          href="/auth/login"
          className="mt-4 inline-block text-sm font-medium text-neutral-900 underline"
        >
          Back to login
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Signing you in...">
      <p className="text-sm text-neutral-600">Hang tight, redirecting.</p>
    </AuthShell>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<AuthShell title="Loading..."><span /></AuthShell>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
