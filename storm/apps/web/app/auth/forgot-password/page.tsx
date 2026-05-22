"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "../../../components/domain/AuthShell";
import { Button, Field, FormError } from "../../../components/ui/Field";
import { useRequestPasswordReset } from "../../../features/auth/auth.hooks";

const Schema = z.object({ email: z.string().email("Invalid email") });
type FormValues = z.infer<typeof Schema>;

export default function ForgotPasswordPage() {
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
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MailCheck className="h-7 w-7" />
          </div>
          <p className="text-sm text-text-muted">
            If an account exists for that email, a reset link is on its way. The link
            expires in 30 minutes.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset link."
      footer={
        <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-hover">
          ← Back to login
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          leadingIcon={<Mail className="h-4 w-4" />}
          {...register("email")}
          error={errors.email?.message}
        />
        {error ? (
          <FormError>{(error as { message?: string }).message ?? "Request failed."}</FormError>
        ) : null}
        <Button type="submit" disabled={isLoading} size="lg" fullWidth>
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
