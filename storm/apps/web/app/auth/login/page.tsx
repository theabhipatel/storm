"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "../../../components/domain/AuthShell";
import { Button, Field, FormError } from "../../../components/ui/Field";
import { useLogin } from "../../../features/auth/auth.hooks";

const Schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});
type FormValues = z.infer<typeof Schema>;

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values).unwrap();
      router.push("/");
    } catch {
      /* error in mutation state */
    }
  });

  const apiBase = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "http://localhost:8000";

  return (
    <AuthShell
      title="Log in to Storm"
      subtitle="Welcome back — pick up where you left off."
      footer={
        <>
          New to Storm?{" "}
          <Link href="/auth/signup" className="font-semibold text-primary hover:text-primary-hover">
            Create an account
          </Link>
        </>
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
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          leadingIcon={<Lock className="h-4 w-4" />}
          {...register("password")}
          error={errors.password?.message}
        />
        {error ? (
          <FormError>
            {(error as { code?: string; message?: string }).code === "INVALID_CREDENTIALS"
              ? "Email or password is incorrect."
              : (error as { message?: string }).message ?? "Login failed."}
          </FormError>
        ) : null}
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs font-semibold text-primary hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={isLoading} size="lg" fullWidth>
          {isLoading ? "Signing in..." : "Log in"}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>
      <a
        href={`${apiBase}/api/auth/google`}
        className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text shadow-sm hover:bg-surface-muted"
      >
        <GoogleIcon />
        Continue with Google
      </a>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.05 5.05 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.75 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
