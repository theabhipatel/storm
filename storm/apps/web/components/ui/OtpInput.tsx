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
      <span className="text-sm font-medium text-neutral-800">{label}</span>
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
          "mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-center text-lg tracking-[0.5em] " +
          "focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 " +
          (error ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "")
        }
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
});
