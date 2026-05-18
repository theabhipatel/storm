"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "../../../components/domain/AuthShell";
import { Button, Field, FormError } from "../../../components/ui/Field";
import {
  useAuthBootstrapped,
  useChangePassword,
  useCurrentUser,
} from "../../../features/auth/auth.hooks";

const Schema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(12, "Must be at least 12 characters").max(256),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });
type FormValues = z.infer<typeof Schema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const bootstrapped = useAuthBootstrapped();
  const currentUser = useCurrentUser();
  const [changePassword, { isLoading, isSuccess, error }] = useChangePassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  if (bootstrapped && !currentUser) {
    if (typeof window !== "undefined") router.replace("/auth/login");
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
    } catch {
      /* surfaced in error */
    }
  });

  return (
    <AuthShell title="Change password" subtitle={currentUser ? currentUser.email : ""}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
          error={errors.currentPassword?.message}
        />
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
          error={errors.newPassword?.message}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          {...register("confirm")}
          error={errors.confirm?.message}
        />
        {error ? (
          <FormError>
            {(error as { code?: string; message?: string }).code === "INVALID_CREDENTIALS"
              ? "Current password is incorrect."
              : (error as { message?: string }).message ?? "Change failed."}
          </FormError>
        ) : null}
        {isSuccess ? (
          <p className="text-sm text-green-700">Password updated. Other sessions have been signed out.</p>
        ) : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
