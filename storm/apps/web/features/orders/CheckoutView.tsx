"use client";

import { AlertCircle, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  Address,
  CheckoutInitResponse,
  CreateOrderResponse,
} from "@storm/contracts";

import { AddressForm } from "../../components/domain/AddressForm";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { formatINR } from "../../lib/format";
import { useCurrentUser } from "../auth/auth.hooks";
import {
  useCreateAddressMutation,
  useListAddressesQuery,
  useMeProfileQuery,
} from "../account/account.api";
import {
  useCreateOrderMutation,
  useInitCheckoutMutation,
} from "./orders.api";
import { openRazorpayCheckout } from "./razorpay";

const IDEMPOTENCY_KEY_STORAGE = "storm.checkout.idempotencyKey";

function getOrCreateIdempotencyKey(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const existing = window.sessionStorage.getItem(IDEMPOTENCY_KEY_STORAGE);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  window.sessionStorage.setItem(IDEMPOTENCY_KEY_STORAGE, fresh);
  return fresh;
}

function clearIdempotencyKey(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(IDEMPOTENCY_KEY_STORAGE);
}

export function CheckoutView() {
  const router = useRouter();
  const user = useCurrentUser();
  const meQuery = useMeProfileQuery();
  const addressesQuery = useListAddressesQuery();
  const [initCheckout, initState] = useInitCheckoutMutation();
  const [createOrder, createState] = useCreateOrderMutation();
  const [checkout, setCheckout] = useState<CheckoutInitResponse | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await initCheckout().unwrap();
        if (ignore) return;
        setCheckout(data);
      } catch (err) {
        if (ignore) return;
        const message =
          (err as { data?: { error?: { message?: string } } })?.data?.error?.message ??
          "We couldn't start checkout right now.";
        setError(message);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [initCheckout]);

  useEffect(() => {
    if (addressesQuery.data?.items && selectedAddressId == null) {
      const def = addressesQuery.data.items.find((a) => a.isDefault);
      setSelectedAddressId(def?.id ?? addressesQuery.data.items[0]?.id ?? null);
    }
  }, [addressesQuery.data, selectedAddressId]);

  const selectedAddress = useMemo(
    () => addressesQuery.data?.items.find((a) => a.id === selectedAddressId) ?? null,
    [addressesQuery.data, selectedAddressId],
  );

  if (!user) return null;
  if (error && !checkout) return <ErrorPanel message={error} />;
  if (!checkout) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">Preparing your order…</p>
    );
  }
  if (!checkout.items.length) {
    return (
      <Card padding="lg" className="text-center">
        <h2 className="text-base font-semibold text-text">Your cart is empty</h2>
        <Link
          href="/"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Continue shopping
        </Link>
      </Card>
    );
  }
  const hasOos = checkout.items.some((i) => !i.available);
  const canPlace =
    Boolean(selectedAddress) && !hasOos && !paying && !createState.isLoading;
  const currentStep = !selectedAddress ? 0 : hasOos ? 1 : 2;

  async function handlePlaceOrder(): Promise<void> {
    if (!selectedAddress) return;
    setError(null);
    setPaying(true);
    const idempotencyKey = getOrCreateIdempotencyKey();
    let response: CreateOrderResponse;
    try {
      response = await createOrder({
        body: { addressId: selectedAddress.id, paymentMethod: "razorpay" },
        idempotencyKey,
      }).unwrap();
    } catch (err) {
      const message =
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ??
        "We couldn't place your order. Please try again.";
      setError(message);
      setPaying(false);
      return;
    }

    try {
      await openRazorpayCheckout({
        key: response.razorpayKeyId,
        amount: response.amountPaise,
        currency: "INR",
        razorpayOrderId: response.razorpayOrderId,
        orderId: response.orderId,
        customerName: meQuery.data?.user.name ?? "",
        customerEmail: meQuery.data?.user.email ?? "",
        customerPhone: meQuery.data?.user.mobile ?? selectedAddress.mobile,
        onSuccess: () => {
          clearIdempotencyKey();
          router.push(`/checkout/success?orderId=${response.orderId}`);
        },
        onFailure: () => {
          clearIdempotencyKey();
          router.push(`/checkout/failed?orderId=${response.orderId}`);
        },
        onDismiss: () => {
          setPaying(false);
        },
      });
    } catch {
      setError("Couldn't open the payment window. Please try again.");
      setPaying(false);
    }
  }

  return (
    <div className="space-y-6">
      <StepIndicator
        steps={[
          { label: "Delivery address" },
          { label: "Order review" },
          { label: "Payment" },
        ]}
        current={currentStep}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Step number={1} title="Delivery address">
            <AddressPicker
              addresses={addressesQuery.data?.items ?? []}
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
              isLoading={addressesQuery.isLoading}
            />
          </Step>
          <Step number={2} title="Order review">
            <ul className="space-y-3">
              {checkout.items.map((item) => (
                <li
                  key={item.sku}
                  className="flex items-start justify-between gap-4 rounded-md border border-border bg-surface-muted p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-text">{item.name}</p>
                    <p className="mt-0.5 text-xs text-text-subtle">SKU: {item.sku}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Qty {item.qty} × {formatINR(item.unitPricePaise)}
                    </p>
                    {!item.available ? (
                      <p className="mt-1 text-xs font-semibold text-danger">
                        Out of stock
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-bold text-text">
                    {formatINR(item.lineTotalPaise)}
                  </p>
                </li>
              ))}
            </ul>
          </Step>
          {hasOos ? (
            <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning-soft p-3 text-sm text-warning-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Some items are out of stock. Please{" "}
                <Link href="/cart" className="underline">
                  update your cart
                </Link>{" "}
                to proceed.
              </p>
            </div>
          ) : null}
        </div>
        <Summary
          checkout={checkout}
          canPlace={canPlace}
          loading={createState.isLoading || initState.isLoading || paying}
          onPlace={handlePlaceOrder}
          error={error}
        />
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card padding="lg">
      <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-text">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

function AddressPicker(props: {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}) {
  if (props.isLoading)
    return <p className="text-sm text-text-muted">Loading addresses…</p>;
  if (props.addresses.length === 0) {
    return <InlineFirstAddress onCreated={(id) => props.onSelect(id)} />;
  }
  return (
    <ul className="space-y-2.5">
      {props.addresses.map((addr) => {
        const checked = addr.id === props.selectedId;
        return (
          <li key={addr.id}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-md border-2 p-3 transition ${
                checked
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-surface hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="checkout-address"
                value={addr.id}
                checked={checked}
                onChange={() => props.onSelect(addr.id)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">{addr.label}</span>
                  {addr.isDefault ? (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-success">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-text">{addr.fullName}</p>
                <p className="text-text-muted">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
                  {addr.pincode}
                </p>
                <p className="text-text-subtle">+91 {addr.mobile}</p>
              </div>
            </label>
          </li>
        );
      })}
      <li>
        <Link
          href="/account/addresses?return=/checkout"
          className="text-sm font-semibold text-primary hover:text-primary-hover"
        >
          + Add a new address
        </Link>
      </li>
    </ul>
  );
}

function Summary(props: {
  checkout: CheckoutInitResponse;
  canPlace: boolean;
  loading: boolean;
  onPlace: () => void;
  error: string | null;
}) {
  const { checkout } = props;
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <Card padding="lg">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text">
          Price details
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Items ({checkout.itemsCount})</dt>
            <dd className="text-text">{formatINR(checkout.subtotalPaise)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Shipping</dt>
            <dd className={checkout.shippingFeePaise === 0 ? "font-semibold text-success" : "text-text"}>
              {checkout.shippingFeePaise === 0
                ? "FREE"
                : formatINR(checkout.shippingFeePaise)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-dashed border-border pt-3 text-base font-bold">
            <dt className="text-text">Total</dt>
            <dd className="text-text">{formatINR(checkout.totalPaise)}</dd>
          </div>
        </dl>
        {checkout.shippingFeePaise > 0 ? (
          <p className="mt-3 text-xs text-text-subtle">
            Free shipping on orders above {formatINR(checkout.freeShippingThresholdPaise)}.
          </p>
        ) : null}
        {props.error ? (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            {props.error}
          </div>
        ) : null}
        <Button
          variant="accent"
          size="lg"
          fullWidth
          disabled={!props.canPlace}
          onClick={props.onPlace}
          leadingIcon={<Lock className="h-4 w-4" />}
          className="mt-5"
        >
          {props.loading ? "Processing…" : `Place order · ${formatINR(checkout.totalPaise)}`}
        </Button>
        <p className="mt-4 inline-flex items-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="h-4 w-4 text-success" />
          Safe & secure payments
        </p>
      </Card>
    </aside>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <Card padding="lg" className="text-center">
      <AlertCircle className="mx-auto h-10 w-10 text-danger" />
      <p className="mt-3 text-base font-semibold text-text">{message}</p>
      <Link
        href="/cart"
        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
      >
        Back to cart
      </Link>
    </Card>
  );
}

function InlineFirstAddress({ onCreated }: { onCreated: (id: string) => void }) {
  const [createAddress, state] = useCreateAddressMutation();
  return (
    <div className="space-y-3 text-sm">
      <p className="text-text-muted">Add your first delivery address to continue.</p>
      <AddressForm
        submitLabel="Save and use this address"
        submittingLabel="Saving…"
        isSubmitting={state.isLoading}
        error={
          (state.error as { data?: { error?: { code?: string; message?: string } } })
            ?.data?.error
        }
        allowSetDefault
        onSubmit={async (values) => {
          const created = await createAddress({
            ...values,
            isDefault: true,
          }).unwrap();
          onCreated(created.address.id);
        }}
      />
    </div>
  );
}
