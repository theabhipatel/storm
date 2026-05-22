import { Check } from "lucide-react";

interface Step {
  label: string;
}

export function StepIndicator({
  steps,
  current,
  className = "",
}: {
  steps: Step[];
  current: number;
  className?: string;
}) {
  return (
    <ol
      aria-label="Progress"
      className={`flex w-full items-center gap-2 ${className}`}
    >
      {steps.map((step, idx) => {
        const isDone = idx < current;
        const isActive = idx === current;
        return (
          <li key={step.label} className="flex flex-1 items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isDone
                  ? "bg-success text-success-foreground"
                  : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-strong text-text-muted"
              }`}
            >
              {isDone ? <Check className="h-4 w-4" /> : idx + 1}
            </span>
            <span
              className={`hidden text-sm font-medium sm:inline ${
                isActive ? "text-text" : "text-text-muted"
              }`}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`mx-1 h-px flex-1 ${
                  isDone ? "bg-success" : "bg-border"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
