import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Field, FormError } from "../components/Field";
import { AuthShell } from "../components/shell/AuthShell";
import { Button } from "../components/ui/Button";
import { useRequestPasswordReset } from "../features/auth/auth.hooks";

const Schema = z.object({ email: z.string().email("Invalid email") });
type FormValues = z.infer<typeof Schema>;

export function ForgotPasswordPage() {
  const [requestReset, { isLoading, isSuccess, error }] = useRequestPasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await requestReset(values).unwrap();
    } catch {
      /* surfaced in error */
    }
  });

  if (isSuccess) {
    return (
      <AuthShell title="Check your email">
        <div className="flex items-start gap-3 rounded-md border border-success/30 bg-success-soft p-4 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden />
          <p>
            If an admin account exists for that email, a reset link is on its way. The
            link expires in 30 minutes.
          </p>
        </div>
        <p className="mt-4 text-center text-sm text-text-muted">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your admin email to receive a reset link.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email")}
          error={errors.email?.message}
        />
        {error ? (
          <FormError>{(error as { message?: string }).message ?? "Request failed."}</FormError>
        ) : null}
        <Button type="submit" fullWidth size="lg" disabled={isLoading}>
          {isLoading ? "Sending…" : "Send reset link"}
        </Button>
        <p className="text-center text-sm text-text-muted">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
