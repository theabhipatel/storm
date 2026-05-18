"use client";

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

  let title = "Verifying your email...";
  let body: React.ReactNode = (
    <p className="text-sm text-neutral-600">Hang tight, this takes a second.</p>
  );

  if (!token) {
    title = "Missing token";
    body = (
      <p className="text-sm text-neutral-600">
        This link is incomplete. Request a new verification email from your account.
      </p>
    );
  } else if (isSuccess) {
    title = "Email verified";
    body = (
      <>
        <p className="text-sm text-neutral-600">
          Your account is active. You can log in now.
        </p>
        <a
          href="/auth/login"
          className="mt-4 inline-block text-sm font-medium text-neutral-900 underline"
        >
          Continue to login
        </a>
      </>
    );
  } else if (error) {
    title = "Link invalid or expired";
    body = (
      <p className="text-sm text-neutral-600">
        Request a new verification link from your account, or contact support.
      </p>
    );
  } else if (isLoading) {
    title = "Verifying your email...";
  }

  return <AuthShell title={title}>{body}</AuthShell>;
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<AuthShell title="Loading..."><span /></AuthShell>}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
