"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
    <AuthShell title="Log in to Storm">
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
        {error ? (
          <FormError>
            {(error as { code?: string; message?: string }).code === "INVALID_CREDENTIALS"
              ? "Email or password is incorrect."
              : (error as { message?: string }).message ?? "Login failed."}
          </FormError>
        ) : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Log in"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <a href="/auth/forgot-password" className="text-neutral-700 underline">
            Forgot password?
          </a>
          <a href="/auth/signup" className="text-neutral-700 underline">
            Create account
          </a>
        </div>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-neutral-500">
        <span className="h-px flex-1 bg-neutral-200" />
        OR
        <span className="h-px flex-1 bg-neutral-200" />
      </div>
      <a
        href={`${apiBase}/api/auth/google`}
        className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-medium text-neutral-800 hover:bg-neutral-50"
      >
        Continue with Google
      </a>
    </AuthShell>
  );
}
