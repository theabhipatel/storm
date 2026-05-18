import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { AuthShell } from "../components/AuthShell";
import { Button, Field, FormError } from "../components/Field";
import { useConfirmPasswordReset } from "../features/auth/auth.hooks";

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

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [confirmReset, { isLoading, error }] = useConfirmPasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  if (!token) {
    return (
      <AuthShell title="Missing token">
        <p className="text-sm text-neutral-600">Request a new reset email.</p>
      </AuthShell>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await confirmReset({ token, password: values.password }).unwrap();
      navigate("/login", { replace: true });
    } catch {
      /* surfaced in error */
    }
  });

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
