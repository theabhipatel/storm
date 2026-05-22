import { AlertCircle } from "lucide-react";
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
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        ref={ref}
        id={inputId}
        {...rest}
        className={
          "mt-1 block w-full rounded-md border bg-surface px-3 py-2 text-sm shadow-sm transition " +
          "placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring/30 " +
          (error
            ? "border-danger focus:border-danger focus:ring-danger/30"
            : "border-border focus:border-primary")
        }
      />
      {hint ? <p className="mt-1 text-xs text-text-subtle">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </label>
  );
});

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export { Button } from "./ui/Button";
