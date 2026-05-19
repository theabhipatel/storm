"use client";

import Link from "next/link";

import type { Address } from "../../features/account/account.types";

export function AddressCard({
  address,
  onDelete,
  onSetDefault,
  disableDelete,
}: {
  address: Address;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  disableDelete?: boolean;
}) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">{address.label}</span>
            {address.isDefault ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Default
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-neutral-800">{address.fullName}</p>
          <p className="text-sm text-neutral-600">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
          </p>
          {address.landmark ? (
            <p className="text-sm text-neutral-600">Landmark: {address.landmark}</p>
          ) : null}
          <p className="text-sm text-neutral-600">
            {address.city}, {address.state} {address.pincode}
          </p>
          <p className="mt-1 text-sm text-neutral-500">+91 {address.mobile}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2 text-sm">
        <Link
          href={`/account/addresses/${address.id}/edit`}
          className="text-neutral-700 underline-offset-2 hover:underline"
        >
          Edit
        </Link>
        {!address.isDefault ? (
          <button
            type="button"
            onClick={() => onSetDefault(address.id)}
            className="text-neutral-700 underline-offset-2 hover:underline"
          >
            Set as default
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(address.id)}
          disabled={disableDelete}
          title={disableDelete ? "You must keep at least one address" : undefined}
          className="text-red-600 underline-offset-2 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
