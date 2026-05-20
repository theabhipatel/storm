export interface RazorpayOpenInput {
  key: string;
  amount: number;
  currency: "INR";
  razorpayOrderId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (resp: RazorpaySuccessResponse) => void;
  onFailure: (resp: RazorpayFailureResponse) => void;
  onDismiss: () => void;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code: string;
    description: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

interface RazorpayCheckoutInstance {
  open(): void;
  on(event: "payment.failed", cb: (resp: RazorpayFailureResponse) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckoutInstance;
  }
}

const SDK_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let loadingPromise: Promise<void> | null = null;

export async function loadRazorpaySdk(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.Razorpay) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("razorpay_sdk_load_failed")), {
        once: true,
      });
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("razorpay_sdk_load_failed"));
    document.head.appendChild(s);
  });
  return loadingPromise;
}

export async function openRazorpayCheckout(input: RazorpayOpenInput): Promise<void> {
  await loadRazorpaySdk();
  if (typeof window === "undefined" || !window.Razorpay) {
    throw new Error("razorpay_sdk_unavailable");
  }
  const rzp = new window.Razorpay({
    key: input.key,
    amount: input.amount,
    currency: input.currency,
    order_id: input.razorpayOrderId,
    name: "Storm",
    description: `Order ${input.orderId.slice(0, 8)}`,
    prefill: {
      name: input.customerName,
      email: input.customerEmail,
      contact: input.customerPhone,
    },
    handler: (resp: RazorpaySuccessResponse) => input.onSuccess(resp),
    modal: {
      ondismiss: () => input.onDismiss(),
    },
    theme: { color: "#0b5cff" },
  });
  rzp.on("payment.failed", (resp) => input.onFailure(resp));
  rzp.open();
}
