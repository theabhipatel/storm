export type ToastVariant = "default" | "success" | "error" | "warning";

export interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit(): void {
  for (const l of listeners) l(toasts);
}

function nextId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

export function dismissToast(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function pushToast(input: Omit<Toast, "id"> & { id?: string }): string {
  const id = input.id ?? nextId();
  const durationMs = input.durationMs ?? 4000;
  const t: Toast = {
    id,
    message: input.message,
    variant: input.variant ?? "default",
    durationMs,
  };
  toasts = [...toasts.filter((x) => x.id !== id), t];
  emit();
  if (durationMs > 0) {
    timers.set(
      id,
      setTimeout(() => dismissToast(id), durationMs),
    );
  }
  return id;
}

export const toast = {
  show: (message: string) => pushToast({ message, variant: "default" }),
  success: (message: string) => pushToast({ message, variant: "success" }),
  error: (message: string) => pushToast({ message, variant: "error" }),
  warning: (message: string) => pushToast({ message, variant: "warning" }),
};
