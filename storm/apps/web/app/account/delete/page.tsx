"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AccountDeleteSchema } from "@storm/contracts";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { AccountShell } from "../../../components/domain/AccountShell";
import { Button, Field, FormError } from "../../../components/ui/Field";
import { useDeleteAccountMutation } from "../../../features/account/account.api";

interface FormValues {
  currentPassword: string;
  confirm: true;
}

export default function DeleteAccountPage() {
  const router = useRouter();
  const [deleteAccount, { isLoading, error }] = useDeleteAccountMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(AccountDeleteSchema) });

  return (
    <AccountShell title="Delete account">
      <div className="flex items-start gap-3 rounded-md border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <p>
          This will permanently delete your Storm account, sign you out everywhere, and
          anonymize your personal data. <strong>This cannot be undone.</strong>
        </p>
      </div>

      <form
        onSubmit={handleSubmit(async (v) => {
          try {
            await deleteAccount(v).unwrap();
            router.replace("/auth/login");
          } catch {
            /* surfaced */
          }
        })}
        className="mt-6 space-y-4"
      >
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
          error={errors.currentPassword?.message}
        />
        <label className="flex items-start gap-2 text-sm text-text">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border accent-danger"
            {...register("confirm")}
          />
          <span>I understand this is permanent.</span>
        </label>
        {errors.confirm ? (
          <p className="text-xs text-danger">You must check the box to continue.</p>
        ) : null}
        {error ? (
          <FormError>
            {(error as { code?: string }).code === "INVALID_CREDENTIALS"
              ? "Current password is incorrect."
              : (error as { message?: string }).message ?? "Could not delete account."}
          </FormError>
        ) : null}
        <Button type="submit" disabled={isLoading} variant="danger" fullWidth>
          {isLoading ? "Deleting…" : "Delete my account"}
        </Button>
      </form>
    </AccountShell>
  );
}
