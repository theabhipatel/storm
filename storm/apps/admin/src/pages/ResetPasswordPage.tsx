import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { Field, FormError } from "../components/Field";
import { AuthShell } from "../components/shell/AuthShell";
import { Button } from "../components/ui/Button";
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
        <p className="text-sm text-text-muted">
          The reset link is missing or invalid. Request a new reset email.
        </p>
        <p className="mt-4 text-center text-sm">
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Request a new link
          </Link>
        </p>
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
    <AuthShell title="Choose a new password" subtitle="Pick something at least 12 characters.">
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
        <Button type="submit" fullWidth size="lg" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </AuthShell>
  );
}
