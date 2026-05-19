"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  EmailChangeRequestSchema,
  MobileChangeRequestSchema,
  ProfileUpdateSchema,
} from "@storm/contracts";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AccountShell } from "../../../components/domain/AccountShell";
import { Button, Field, FormError } from "../../../components/ui/Field";
import { OtpInput } from "../../../components/ui/OtpInput";
import {
  useConfirmMobileChangeMutation,
  useMeProfileQuery,
  useRequestEmailChangeMutation,
  useRequestMobileChangeMutation,
  useUpdateNameMutation,
} from "../../../features/account/account.api";

export default function ProfilePage() {
  const { data, isLoading } = useMeProfileQuery();
  return (
    <AccountShell title="Profile">
      {isLoading || !data ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="space-y-8">
          <NameForm initialName={data.user.name} />
          <hr />
          <EmailForm currentEmail={data.user.email} />
          <hr />
          <MobileForm currentMobile={data.user.mobile} />
        </div>
      )}
    </AccountShell>
  );
}

function NameForm({ initialName }: { initialName: string }) {
  const [updateName, state] = useUpdateNameMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: { name: initialName },
  });
  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        try {
          await updateName(v).unwrap();
        } catch {
          /* surfaced */
        }
      })}
      className="space-y-3"
    >
      <h2 className="text-sm font-semibold text-neutral-900">Name</h2>
      <Field label="Display name" {...register("name")} error={errors.name?.message} />
      {state.error ? (
        <FormError>
          {(state.error as { message?: string }).message ?? "Could not update name."}
        </FormError>
      ) : null}
      {state.isSuccess ? (
        <p className="text-sm text-emerald-700">Name updated.</p>
      ) : null}
      <Button type="submit" disabled={state.isLoading}>
        {state.isLoading ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [requestEmailChange, state] = useRequestEmailChangeMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ newEmail: string; currentPassword: string }>({
    resolver: zodResolver(EmailChangeRequestSchema),
  });
  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        try {
          await requestEmailChange(v).unwrap();
        } catch {
          /* surfaced */
        }
      })}
      className="space-y-3"
    >
      <h2 className="text-sm font-semibold text-neutral-900">Email</h2>
      <p className="text-xs text-neutral-500">Current: {currentEmail}</p>
      <Field
        label="New email"
        type="email"
        {...register("newEmail")}
        error={errors.newEmail?.message}
      />
      <Field
        label="Current password"
        type="password"
        autoComplete="current-password"
        {...register("currentPassword")}
        error={errors.currentPassword?.message}
      />
      {state.error ? (
        <FormError>
          {(state.error as { code?: string; message?: string }).code === "EMAIL_TAKEN"
            ? "That email is already in use."
            : (state.error as { code?: string }).code === "INVALID_CREDENTIALS"
              ? "Current password is incorrect."
              : (state.error as { message?: string }).message ?? "Could not request change."}
        </FormError>
      ) : null}
      {state.isSuccess ? (
        <p className="text-sm text-emerald-700">
          Verification email sent. Your old email continues to work until you click the
          confirmation link.
        </p>
      ) : null}
      <Button type="submit" disabled={state.isLoading}>
        {state.isLoading ? "Sending…" : "Request change"}
      </Button>
    </form>
  );
}

function MobileForm({ currentMobile }: { currentMobile: string | null }) {
  const [requestMobileChange, reqState] = useRequestMobileChangeMutation();
  const [confirmMobileChange, confState] = useConfirmMobileChangeMutation();
  const [otpSent, setOtpSent] = useState(false);

  const requestForm = useForm<{ newMobile: string; currentPassword: string }>({
    resolver: zodResolver(MobileChangeRequestSchema),
  });
  const otpForm = useForm<{ otp: string }>();

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-neutral-900">Mobile</h2>
      <p className="text-xs text-neutral-500">
        Current: {currentMobile ? `+91 ${currentMobile}` : "Not set"}
      </p>
      <form
        onSubmit={requestForm.handleSubmit(async (v) => {
          try {
            await requestMobileChange(v).unwrap();
            setOtpSent(true);
          } catch {
            /* surfaced */
          }
        })}
        className="space-y-3"
      >
        <Field
          label="New mobile (10 digits, starts 6-9)"
          {...requestForm.register("newMobile")}
          error={requestForm.formState.errors.newMobile?.message}
        />
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          {...requestForm.register("currentPassword")}
          error={requestForm.formState.errors.currentPassword?.message}
        />
        {reqState.error ? (
          <FormError>
            {(reqState.error as { code?: string }).code === "INVALID_CREDENTIALS"
              ? "Current password is incorrect."
              : (reqState.error as { message?: string }).message ?? "Could not send OTP."}
          </FormError>
        ) : null}
        <Button type="submit" disabled={reqState.isLoading}>
          {reqState.isLoading ? "Sending…" : "Send OTP"}
        </Button>
      </form>

      {otpSent ? (
        <form
          onSubmit={otpForm.handleSubmit(async (v) => {
            try {
              await confirmMobileChange(v).unwrap();
              setOtpSent(false);
            } catch {
              /* surfaced */
            }
          })}
          className="space-y-3 border-t border-neutral-100 pt-3"
        >
          <OtpInput
            {...otpForm.register("otp", { pattern: /^\d{6}$/ })}
            error={otpForm.formState.errors.otp?.message as string | undefined}
          />
          {confState.error ? (
            <FormError>
              {(confState.error as { code?: string }).code === "OTP_INVALID"
                ? "OTP invalid."
                : (confState.error as { code?: string }).code === "OTP_EXHAUSTED"
                  ? "Too many attempts. Request a new OTP."
                  : (confState.error as { message?: string }).message ?? "Verification failed."}
            </FormError>
          ) : null}
          {confState.isSuccess ? (
            <p className="text-sm text-emerald-700">Mobile updated.</p>
          ) : null}
          <Button type="submit" disabled={confState.isLoading}>
            {confState.isLoading ? "Verifying…" : "Verify"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
