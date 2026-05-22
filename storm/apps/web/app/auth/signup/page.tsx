"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
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
    <AuthShell
      title="Create your Storm account"
      subtitle="Free to join. Takes about 2 minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-hover">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Name"
          autoComplete="name"
          leadingIcon={<User className="h-4 w-4" />}
          {...register("name")}
          error={errors.name?.message}
        />
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
          autoComplete="new-password"
          leadingIcon={<Lock className="h-4 w-4" />}
          {...register("password")}
          error={errors.password?.message}
          hint="At least 12 characters. We check against breach lists."
        />
        {error ? (
          <FormError>
            {(error as { message?: string }).message ?? "Sign-up failed."}
          </FormError>
        ) : null}
        <Button type="submit" disabled={isLoading} size="lg" fullWidth>
          {isLoading ? "Creating..." : "Create account"}
        </Button>
        <p className="text-center text-xs text-text-subtle">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="font-semibold text-primary hover:text-primary-hover">
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
