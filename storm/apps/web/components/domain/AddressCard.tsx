"use client";

import { Check, Edit3, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";

import type { Address } from "../../features/account/account.types";
import { Card } from "../ui/Card";

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
    <Card padding="md">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-text">{address.label}</span>
            {address.isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-success">
                <Check className="h-3 w-3" />
                Default
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-text">{address.fullName}</p>
          <p className="text-sm text-text-muted">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
          </p>
          {address.landmark ? (
            <p className="text-sm text-text-muted">Landmark: {address.landmark}</p>
          ) : null}
          <p className="text-sm text-text-muted">
            {address.city}, {address.state} {address.pincode}
          </p>
          <p className="mt-1 text-sm text-text-subtle">+91 {address.mobile}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3 text-sm">
        <Link
          href={`/account/addresses/${address.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold text-primary hover:bg-primary-soft"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </Link>
        {!address.isDefault ? (
          <button
            type="button"
            onClick={() => onSetDefault(address.id)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold text-text hover:bg-surface-muted"
          >
            Set as default
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(address.id)}
          disabled={disableDelete}
          title={disableDelete ? "You must keep at least one address" : undefined}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold text-danger hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </Card>
  );
}
