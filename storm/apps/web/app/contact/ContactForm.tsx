"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { indiaPhoneSchema } from "../../lib/format";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: indiaPhoneSchema,
  message: z.string().trim().min(10, "Tell us a little more (10+ chars)"),
});

type FormState = "idle" | "submitting" | "sent" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      message: form.get("message"),
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setState("submitting");
    try {
      // eslint-disable-next-line no-console
      console.info("[storm-contact]", parsed.data);
      await new Promise((r) => setTimeout(r, 400));
      setState("sent");
      e.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="not-prose mt-3 flex items-start gap-3 rounded-md border border-success/30 bg-success-soft p-4 text-sm text-success">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <p>
          Thanks — we&rsquo;ve received your message and will reply within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form className="not-prose mt-3 grid gap-4" onSubmit={onSubmit} noValidate>
      <Row label="Your name" name="name" type="text" error={errors.name ?? ""} required />
      <Row label="Email" name="email" type="email" error={errors.email ?? ""} required />
      <Row
        label="Mobile (10 digits)"
        name="phone"
        type="tel"
        error={errors.phone ?? ""}
        required
        prefix="+91"
      />
      <label className="block">
        <span className="text-sm font-medium text-text">Message</span>
        <textarea
          name="message"
          rows={5}
          required
          className="mt-1.5 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        {errors.message ? (
          <span className="mt-1 block text-xs text-danger">{errors.message}</span>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex w-fit items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Send message"}
      </button>
      {state === "error" ? (
        <p className="text-xs text-danger">
          Could not send right now. Please email support@storm.example.
        </p>
      ) : null}
    </form>
  );
}

function Row({
  label,
  name,
  type,
  error,
  required,
  prefix,
}: {
  label: string;
  name: string;
  type: string;
  error?: string;
  required?: boolean;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <div
        className={
          prefix
            ? "mt-1.5 flex overflow-hidden rounded-md border border-border bg-surface shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30"
            : "mt-1.5"
        }
      >
        {prefix ? (
          <span className="select-none border-r border-border bg-surface-muted px-3 py-2 text-sm font-medium text-text-muted">
            {prefix}
          </span>
        ) : null}
        <input
          name={name}
          type={type}
          required={required}
          className={
            prefix
              ? "flex-1 bg-surface px-3 py-2 text-sm focus:outline-none"
              : "block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          }
        />
      </div>
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : null}
    </label>
  );
}
