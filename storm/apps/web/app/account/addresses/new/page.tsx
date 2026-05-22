"use client";

import { useRouter } from "next/navigation";

import { AccountShell } from "../../../../components/domain/AccountShell";
import { AddressForm } from "../../../../components/domain/AddressForm";
import { useCreateAddressMutation } from "../../../../features/account/account.api";

export default function NewAddressPage() {
  const router = useRouter();
  const [createAddress, { isLoading, error }] = useCreateAddressMutation();

  return (
    <AccountShell title="Add a new address">
      <AddressForm
        submitLabel="Save address"
        submittingLabel="Saving…"
        isSubmitting={isLoading}
        error={error as { code?: string; message?: string } | undefined}
        allowSetDefault
        onSubmit={async (values) => {
          try {
            await createAddress(values).unwrap();
            router.push("/account/addresses");
          } catch {
            /* surfaced via `error` */
          }
        }}
      />
    </AccountShell>
  );
}
