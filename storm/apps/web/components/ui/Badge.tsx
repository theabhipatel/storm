import type { ReactNode } from "react";

type Variant = "primary" | "success" | "warning" | "danger" | "neutral" | "accent";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
  neutral: "bg-surface-strong text-text",
  accent: "bg-accent text-accent-foreground",
};

const SIZES: Record<Size, string> = {
  sm: "h-5 px-1.5 text-[10px]",
  md: "h-6 px-2 text-xs",
};

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  leadingIcon,
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold leading-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim()}
    >
      {leadingIcon ? <span className="inline-flex">{leadingIcon}</span> : null}
      {children}
    </span>
  );
}
