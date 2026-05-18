"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "../../../components/domain/AuthShell";
import { Button, Field, FormError } from "../../../components/ui/Field";
import { useConfirmPasswordReset } from "../../../features/auth/auth.hooks";

const Schema = z
  .object({
    password: z.string().min(12, "Must be at least 12 characters").max(256),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });
type FormValues = z.infer<typeof Schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [confirmReset, { isLoading, error }] = useConfirmPasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await confirmReset({ token, password: values.password }).unwrap();
      router.push("/auth/login");
    } catch {
      /* surfaced in error */
    }
  });

  if (!token) {
    return (
      <AuthShell title="Missing token">
        <p className="text-sm text-neutral-600">
          This link is incomplete. Request a new reset email.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          {...register("confirm")}
          error={errors.confirm?.message}
        />
        {error ? (
          <FormError>{(error as { message?: string }).message ?? "Reset failed."}</FormError>
        ) : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save new password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthShell title="Loading..."><span /></AuthShell>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
