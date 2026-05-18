"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "../../../components/domain/AuthShell";
import { Button, Field, FormError } from "../../../components/ui/Field";
import { useSignup } from "../../../features/auth/auth.hooks";

const Schema = z.object({
  name: z.string().min(1, "Required").max(120),
  email: z.string().email("Invalid email").max(254),
  password: z.string().min(12, "Must be at least 12 characters").max(256),
});
type FormValues = z.infer<typeof Schema>;

export default function SignupPage() {
  const router = useRouter();
  const [signup, { isLoading, error }] = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signup(values).unwrap();
      router.push("/auth/check-email");
    } catch {
      /* error already in mutation state */
    }
  });

  return (
    <AuthShell title="Create your Storm account" subtitle="Free to join. 2 minutes.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name" {...register("name")} autoComplete="name" error={errors.name?.message} />
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
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
          hint="At least 12 characters. We check against breach lists."
        />
        {error ? <FormError>{(error as { message?: string }).message ?? "Sign-up failed."}</FormError> : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Sign up"}
        </Button>
        <p className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <a href="/auth/login" className="font-medium text-neutral-900 underline">
            Log in
          </a>
        </p>
      </form>
    </AuthShell>
  );
}
