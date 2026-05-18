import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "../components/AuthShell";
import { Button, Field, FormError } from "../components/Field";
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
        <p className="text-sm text-neutral-600">
          If an admin account exists for that email, a reset link is on its way. The link
          expires in 30 minutes.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your admin email.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        {error ? (
          <FormError>{(error as { message?: string }).message ?? "Request failed."}</FormError>
        ) : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
        <p className="text-center text-sm">
          <a href="/login" className="text-neutral-700 underline">
            Back to login
          </a>
        </p>
      </form>
    </AuthShell>
  );
}
