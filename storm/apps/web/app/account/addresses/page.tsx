"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AccountShell } from "../../../components/domain/AccountShell";
import { AddressCard } from "../../../components/domain/AddressCard";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { FormError } from "../../../components/ui/Field";
import {
  useDeleteAddressMutation,
  useListAddressesQuery,
  useSetDefaultAddressMutation,
} from "../../../features/account/account.api";

export default function AddressesPage() {
  const { data, isLoading } = useListAddressesQuery();
  const [setDefault, setDefaultState] = useSetDefaultAddressMutation();
  const [deleteAddress, deleteState] = useDeleteAddressMutation();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const addresses = data?.items ?? [];
  const isLast = addresses.length === 1;
  const target = pendingDelete ? addresses.find((a) => a.id === pendingDelete) ?? null : null;
  const blockDelete =
    target?.isDefault && addresses.length > 1
      ? "Set another address as default before deleting this one."
      : null;

  return (
    <AccountShell title="Saved addresses">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{addresses.length} of 10 saved</p>
        <Link
          href="/account/addresses/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Add new
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-text-muted">Loading…</p>
      ) : addresses.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-text-muted">
          No addresses yet.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id}>
              <AddressCard
                address={a}
                onSetDefault={(id) => setDefault(id)}
                onDelete={(id) => setPendingDelete(id)}
                disableDelete={isLast && a.isDefault}
              />
            </li>
          ))}
        </ul>
      )}

      {setDefaultState.error ? (
        <div className="mt-4">
          <FormError>
            {(setDefaultState.error as { message?: string }).message ??
              "Could not set default."}
          </FormError>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete address?"
        message={
          blockDelete ??
          (target
            ? `This will remove "${target.label}" from your saved addresses.`
            : "")
        }
        confirmLabel="Delete"
        variant="danger"
        disabled={deleteState.isLoading || Boolean(blockDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete || blockDelete) return;
          try {
            await deleteAddress(pendingDelete).unwrap();
          } catch {
            /* surfaced via error */
          }
          setPendingDelete(null);
        }}
      >
        {deleteState.error ? (
          <FormError>
            {(deleteState.error as { code?: string }).code === "ADDRESS_DEFAULT_REQUIRED"
              ? "Set another address as default before deleting this one."
              : (deleteState.error as { message?: string }).message ?? "Could not delete."}
          </FormError>
        ) : null}
      </ConfirmDialog>

      <div className="mt-8 flex justify-end">
        <Link
          href="/account"
          className="text-sm font-semibold text-primary hover:text-primary-hover"
        >
          ← Back to overview
        </Link>
      </div>
    </AccountShell>
  );
}
