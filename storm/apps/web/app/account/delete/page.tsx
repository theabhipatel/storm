"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AccountDeleteSchema } from "@storm/contracts";
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
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        This will permanently delete your Storm account, sign you out everywhere, and
        anonymize your personal data. This cannot be undone.
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
        <label className="flex items-start gap-2 text-sm text-neutral-700">
          <input type="checkbox" className="mt-0.5" {...register("confirm")} />
          <span>I understand this is permanent.</span>
        </label>
        {errors.confirm ? (
          <p className="text-xs text-red-600">You must check the box to continue.</p>
        ) : null}
        {error ? (
          <FormError>
            {(error as { code?: string }).code === "INVALID_CREDENTIALS"
              ? "Current password is incorrect."
              : (error as { message?: string }).message ?? "Could not delete account."}
          </FormError>
        ) : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Deleting…" : "Delete my account"}
        </Button>
      </form>
    </AccountShell>
  );
}
