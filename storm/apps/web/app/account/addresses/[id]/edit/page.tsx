"use client";

import { useParams, useRouter } from "next/navigation";

import { AccountShell } from "../../../../../components/domain/AccountShell";
import { AddressForm } from "../../../../../components/domain/AddressForm";
import {
  useGetAddressQuery,
  useUpdateAddressMutation,
} from "../../../../../features/account/account.api";

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { data, isLoading } = useGetAddressQuery(id, { skip: !id });
  const [updateAddress, { isLoading: saving, error }] = useUpdateAddressMutation();

  return (
    <AccountShell title="Edit address">
      {isLoading || !data ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <AddressForm
          defaultValues={{
            label: data.address.label,
            fullName: data.address.fullName,
            mobile: data.address.mobile,
            line1: data.address.line1,
            line2: data.address.line2 ?? undefined,
            landmark: data.address.landmark ?? undefined,
            city: data.address.city,
            state: data.address.state,
            pincode: data.address.pincode,
            country: "IN",
            isDefault: data.address.isDefault,
          }}
          submitLabel="Save changes"
          submittingLabel="Saving…"
          isSubmitting={saving}
          error={error as { code?: string; message?: string } | undefined}
          allowSetDefault={!data.address.isDefault}
          onSubmit={async (values) => {
            try {
              await updateAddress({ id, input: values }).unwrap();
              router.push("/account/addresses");
            } catch {
              /* surfaced via `error` */
            }
          }}
        />
      )}
    </AccountShell>
  );
}
