import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { AuthShell } from "../components/AuthShell";
import { Button, Field, FormError } from "../components/Field";
import { useLogout, useLogin } from "../features/auth/auth.hooks";
import { setCurrentUser } from "../features/auth/auth.slice";

const Schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});
type FormValues = z.infer<typeof Schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLogin();
  const [logout] = useLogout();
  const [roleError, setRoleError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = handleSubmit(async (values) => {
    setRoleError(null);
    try {
      const res = await login(values).unwrap();
      if (res.user.role !== "admin") {
        // Customer credentials are valid but not allowed here. Roll back the
        // session by calling logout so the server-side state is clean.
        setRoleError("Admin access only.");
        dispatch(setCurrentUser(null));
        await logout();
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch {
      /* error in mutation state */
    }
  });

  const errAny = error as { code?: string; message?: string } | undefined;
  const apiMsg = (() => {
    if (!errAny) return null;
    if (errAny.code === "INVALID_CREDENTIALS") return "Email or password is incorrect.";
    if (errAny.code === "ACCOUNT_BLOCKED") return "This account is blocked.";
    if (errAny.code === "ACCOUNT_LOCKED") return "Too many attempts. Try again later.";
    return errAny.message ?? "Login failed.";
  })();

  return (
    <AuthShell title="Admin login">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />
        {roleError ? <FormError>{roleError}</FormError> : null}
        {apiMsg ? <FormError>{apiMsg}</FormError> : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Log in"}
        </Button>
        <p className="text-center text-sm">
          <a href="/forgot-password" className="text-neutral-700 underline">
            Forgot password?
          </a>
        </p>
      </form>
    </AuthShell>
  );
}
