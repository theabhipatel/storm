import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  type?: "button" | "submit" | "reset";
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
  accent: "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm",
  outline:
    "border border-border-strong bg-surface text-text hover:bg-surface-muted",
  ghost: "bg-transparent text-text hover:bg-surface-muted",
  danger: "bg-danger text-danger-foreground hover:opacity-90 shadow-sm",
  dark: "bg-dark text-dark-foreground hover:bg-dark-soft",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    type = "button",
    variant = "primary",
    size = "md",
    fullWidth,
    leadingIcon,
    trailingIcon,
    children,
    className = "",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`.trim()}
    >
      {leadingIcon ? <span className="-ml-0.5 inline-flex">{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span className="-mr-0.5 inline-flex">{trailingIcon}</span> : null}
    </button>
  );
});
