import { AuthShell } from "../../../components/domain/AuthShell";

export default function CheckEmailPage() {
  return (
    <AuthShell
      title="Check your email"
      subtitle="We sent a verification link to the address you signed up with."
    >
      <p className="text-sm text-neutral-600">
        Click the link in the email to activate your account. The link expires in 24 hours.
      </p>
      <p className="mt-6 text-sm text-neutral-600">
        Already verified?{" "}
        <a href="/auth/login" className="font-medium text-neutral-900 underline">
          Log in
        </a>
      </p>
    </AuthShell>
  );
}
