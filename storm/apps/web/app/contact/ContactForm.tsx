"use client";

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
      // Stage 1: log to console; real contact endpoint is Stage 2.
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
      <div className="not-prose rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Thanks — we&rsquo;ve received your message and will reply within one
        business day.
      </div>
    );
  }

  return (
    <form className="not-prose mt-2 grid gap-3" onSubmit={onSubmit} noValidate>
      <Row label="Your name" name="name" type="text" error={errors.name ?? ""} required />
      <Row label="Email" name="email" type="email" error={errors.email ?? ""} required />
      <Row label="Mobile (10 digits)" name="phone" type="tel" error={errors.phone ?? ""} required prefix="+91" />
      <label className="block">
        <span className="text-xs font-medium text-neutral-700">Message</span>
        <textarea
          name="message"
          rows={5}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
        {errors.message ? (
          <span className="mt-1 block text-xs text-red-600">{errors.message}</span>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex w-fit items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Send message"}
      </button>
      {state === "error" ? (
        <p className="text-xs text-red-600">
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
      <span className="text-xs font-medium text-neutral-700">{label}</span>
      <div className={prefix ? "mt-1 flex rounded-md border border-neutral-300" : "mt-1"}>
        {prefix ? (
          <span className="select-none rounded-l-md border-r border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            {prefix}
          </span>
        ) : null}
        <input
          name={name}
          type={type}
          required={required}
          className={
            prefix
              ? "flex-1 rounded-r-md px-3 py-2 text-sm focus:outline-none"
              : "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          }
        />
      </div>
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}
