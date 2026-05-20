"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  Address,
  CheckoutInitResponse,
  CreateOrderResponse,
} from "@storm/contracts";

import { AddressForm } from "../../components/domain/AddressForm";
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
  if (error) return <ErrorPanel message={error} />;
  if (!checkout) {
    return <p className="py-12 text-center text-neutral-500">Preparing your order…</p>;
  }
  if (!checkout.items.length) {
    return (
      <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-neutral-700">Your cart is empty.</p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }
  const hasOos = checkout.items.some((i) => !i.available);
  const canPlace = Boolean(selectedAddress) && !hasOos && !paying && !createState.isLoading;

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
    } catch (err) {
      setError("Couldn't open the payment window. Please try again.");
      setPaying(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
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
                className="flex items-start justify-between rounded-md border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-sm text-neutral-600">SKU: {item.sku}</p>
                  <p className="text-sm text-neutral-700">
                    Qty {item.qty} × {formatINR(item.unitPricePaise)}
                  </p>
                  {!item.available && (
                    <p className="mt-1 text-xs text-red-600">Out of stock</p>
                  )}
                </div>
                <p className="font-semibold text-neutral-900">
                  {formatINR(item.lineTotalPaise)}
                </p>
              </li>
            ))}
          </ul>
        </Step>
        {hasOos && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Some items are out of stock. Please{" "}
            <Link href="/cart" className="underline">
              update your cart
            </Link>{" "}
            to proceed.
          </p>
        )}
      </section>
      <Summary
        checkout={checkout}
        canPlace={canPlace}
        loading={createState.isLoading || initState.isLoading || paying}
        onPlace={handlePlaceOrder}
        error={error}
      />
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
    <article className="rounded-md border border-neutral-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900">
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </article>
  );
}

function AddressPicker(props: {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}) {
  if (props.isLoading) return <p className="text-sm text-neutral-500">Loading addresses…</p>;
  if (props.addresses.length === 0) {
    return <InlineFirstAddress onCreated={(id) => props.onSelect(id)} />;
  }
  return (
    <ul className="space-y-2">
      {props.addresses.map((addr) => {
        const checked = addr.id === props.selectedId;
        return (
          <li key={addr.id}>
            <label
              className={
                "flex cursor-pointer items-start gap-3 rounded-md border p-3 " +
                (checked ? "border-neutral-900 bg-neutral-50" : "border-neutral-200")
              }
            >
              <input
                type="radio"
                name="checkout-address"
                value={addr.id}
                checked={checked}
                onChange={() => props.onSelect(addr.id)}
                className="mt-1"
              />
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-neutral-800">{addr.fullName}</p>
                <p className="text-neutral-600">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
                </p>
                <p className="text-neutral-500">+91 {addr.mobile}</p>
              </div>
            </label>
          </li>
        );
      })}
      <li>
        <Link
          href="/account/addresses?return=/checkout"
          className="text-sm text-neutral-700 underline-offset-2 hover:underline"
        >
          Add a new address
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
    <aside className="h-fit space-y-3 rounded-md border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Order summary</h2>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-600">Items ({checkout.itemsCount})</dt>
          <dd className="text-neutral-900">{formatINR(checkout.subtotalPaise)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-600">Shipping</dt>
          <dd className="text-neutral-900">
            {checkout.shippingFeePaise === 0 ? "FREE" : formatINR(checkout.shippingFeePaise)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-neutral-100 pt-2">
          <dt className="font-semibold text-neutral-900">Total</dt>
          <dd className="font-semibold text-neutral-900">{formatINR(checkout.totalPaise)}</dd>
        </div>
      </dl>
      {checkout.shippingFeePaise > 0 && (
        <p className="text-xs text-neutral-500">
          Free shipping on orders above {formatINR(checkout.freeShippingThresholdPaise)}.
        </p>
      )}
      {props.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {props.error}
        </p>
      )}
      <button
        type="button"
        onClick={props.onPlace}
        disabled={!props.canPlace}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {props.loading ? "Processing…" : `Place order · ${formatINR(checkout.totalPaise)}`}
      </button>
    </aside>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-700">{message}</p>
      <Link
        href="/cart"
        className="mt-3 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Back to cart
      </Link>
    </div>
  );
}

function InlineFirstAddress({ onCreated }: { onCreated: (id: string) => void }) {
  const [createAddress, state] = useCreateAddressMutation();
  return (
    <div className="space-y-3 text-sm">
      <p className="text-neutral-700">
        Add your first delivery address to continue.
      </p>
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
