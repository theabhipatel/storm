import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

export { Button } from "./Button";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: ReactNode | undefined;
  leadingIcon?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, id, leadingIcon, className, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-medium text-text">{label}</span>
      <div className="relative mt-1.5">
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-subtle">
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          {...rest}
          className={
            "block w-full rounded-md border bg-surface px-3 py-2.5 text-sm shadow-sm transition " +
            "placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring/30 " +
            (leadingIcon ? "pl-10 " : "") +
            (error
              ? "border-danger focus:border-danger focus:ring-danger/30 "
              : "border-border focus:border-primary ") +
            (className ?? "")
          }
        />
      </div>
      {hint ? <p className="mt-1 text-xs text-text-subtle">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </label>
  );
});

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {children}
    </div>
  );
}
