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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>
      <div className="grid grid-cols-2 gap-4">
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
            <span className="text-sm font-medium text-text">State</span>
            <select
              {...field}
              value={field.value ?? ""}
              className="mt-1.5 block w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
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
              <p className="mt-1 text-xs text-danger">{errors.state.message}</p>
            ) : null}
          </label>
        )}
      />
      {allowSetDefault ? (
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            {...register("isDefault")}
            className="h-4 w-4 rounded border-border accent-primary"
          />
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
