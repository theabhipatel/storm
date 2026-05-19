"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  AddressCreateSchema,
  INDIAN_STATES,
  type AddressCreateInput,
} from "@storm/contracts";

import { Button, Field, FormError } from "../ui/Field";

export type AddressFormValues = AddressCreateInput;

export function AddressForm({
  defaultValues,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  error,
  allowSetDefault,
}: {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  error?: { code?: string; message?: string } | undefined;
  allowSetDefault?: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(AddressCreateSchema),
    defaultValues: {
      country: "IN",
      isDefault: false,
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        await onSubmit(v);
      })}
      className="space-y-4"
    >
      <Field
        label="Label (e.g. Home, Office)"
        {...register("label")}
        error={errors.label?.message}
      />
      <Field
        label="Full name"
        {...register("fullName")}
        error={errors.fullName?.message}
      />
      <Field
        label="Mobile (10 digits, starts 6-9)"
        {...register("mobile")}
        error={errors.mobile?.message}
        hint="+91 will be prepended automatically"
      />
      <Field
        label="Address line 1"
        {...register("line1")}
        error={errors.line1?.message}
      />
      <Field
        label="Address line 2 (optional)"
        {...register("line2")}
        error={errors.line2?.message}
      />
      <Field
        label="Landmark (optional)"
        {...register("landmark")}
        error={errors.landmark?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" {...register("city")} error={errors.city?.message} />
        <Field
          label="Pincode"
          {...register("pincode")}
          error={errors.pincode?.message}
        />
      </div>
      <Controller
        control={control}
        name="state"
        render={({ field }) => (
          <label className="block">
            <span className="text-sm font-medium text-neutral-800">State</span>
            <select
              {...field}
              value={field.value ?? ""}
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="" disabled>
                Select a state
              </option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state ? (
              <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>
            ) : null}
          </label>
        )}
      />
      {allowSetDefault ? (
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" {...register("isDefault")} />
          Set as default address
        </label>
      ) : null}
      {error ? (
        <FormError>{error.message ?? "Could not save address."}</FormError>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}
