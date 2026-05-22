import { MailCheck } from "lucide-react";
import Link from "next/link";

import { AuthShell } from "../../../components/domain/AuthShell";

export default function CheckEmailPage() {
  return (
    <AuthShell
      title="Check your email"
      subtitle="We sent a verification link to your inbox."
      footer={
        <>
          Already verified?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-hover">
            Log in
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <MailCheck className="h-7 w-7" />
        </div>
        <p className="text-sm text-text-muted">
          Click the link in the email to activate your account. The link expires in 24 hours.
        </p>
      </div>
    </AuthShell>
  );
}
