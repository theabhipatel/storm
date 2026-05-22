import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
  hoverable?: boolean;
  children: ReactNode;
}

const PADDING = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  padding = "md",
  bordered = true,
  hoverable = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={`rounded-lg bg-surface shadow-card ${PADDING[padding]} ${
        bordered ? "border border-border" : ""
      } ${hoverable ? "transition hover:shadow-card-hover" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-text">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );
}
