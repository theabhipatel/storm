import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "ghost" | "outline" | "filled";
type Size = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  ghost: "bg-transparent text-text hover:bg-surface-muted",
  outline: "border border-border bg-surface text-text hover:bg-surface-muted",
  filled: "bg-primary text-primary-foreground hover:bg-primary-hover",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "ghost", size = "md", className = "", children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={`inline-flex items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim()}
    >
      {children}
    </button>
  );
});
