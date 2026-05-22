"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, XCircle } from "lucide-react";
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
        <div className="flex items-start gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>This link is incomplete. Request a new reset email.</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Make sure it's at least 12 characters.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          leadingIcon={<Lock className="h-4 w-4" />}
          {...register("password")}
          error={errors.password?.message}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          leadingIcon={<Lock className="h-4 w-4" />}
          {...register("confirm")}
          error={errors.confirm?.message}
        />
        {error ? (
          <FormError>{(error as { message?: string }).message ?? "Reset failed."}</FormError>
        ) : null}
        <Button type="submit" disabled={isLoading} size="lg" fullWidth>
          {isLoading ? "Saving..." : "Save new password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthShell title="Loading...">&nbsp;</AuthShell>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
