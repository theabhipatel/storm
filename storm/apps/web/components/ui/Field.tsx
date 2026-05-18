import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: ReactNode | undefined;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      <input
        ref={ref}
        id={inputId}
        {...rest}
        className={
          "mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm " +
          "shadow-sm placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none " +
          "focus:ring-1 focus:ring-neutral-900 " +
          (error ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "")
        }
      />
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
});

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </div>
  );
}

interface ButtonProps {
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "outline";
}

export function Button({
  type = "button",
  disabled,
  onClick,
  children,
  variant = "primary",
}: ButtonProps) {
  const base =
    "w-full rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-neutral-900 text-white hover:bg-neutral-800"
      : "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
