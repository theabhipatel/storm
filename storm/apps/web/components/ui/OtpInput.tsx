"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface OtpInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string | undefined;
}

export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(
  { label = "Enter OTP", error, id, ...rest },
  ref,
) {
  const inputId = id ?? "otp";
  return (
    <label htmlFor={inputId} className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        ref={ref}
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="\d{6}"
        {...rest}
        className={
          "mt-1.5 block w-full rounded-md border bg-surface px-3 py-3 text-center text-xl font-semibold tracking-[0.5em] shadow-sm transition " +
          "focus:outline-none focus:ring-2 focus:ring-ring/30 " +
          (error
            ? "border-danger focus:border-danger focus:ring-danger/30"
            : "border-border focus:border-primary")
        }
      />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </label>
  );
});
