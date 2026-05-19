"use client";

import Link from "next/link";

import { AccountShell } from "../../components/domain/AccountShell";
import { useMeProfileQuery } from "../../features/account/account.api";

export default function AccountOverviewPage() {
  const { data, isLoading } = useMeProfileQuery();

  return (
    <AccountShell title="Account">
      {isLoading || !data ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="space-y-6">
          <DataRow label="Name" value={data.user.name} />
          <DataRow
            label="Email"
            value={data.user.email}
            badge={data.user.emailVerified ? "verified" : "unverified"}
            link={{ href: "/account/profile", label: "Change" }}
          />
          <DataRow
            label="Mobile"
            value={data.user.mobile ? `+91 ${data.user.mobile}` : "Not set"}
            badge={
              data.user.mobile
                ? data.user.mobileVerified
                  ? "verified"
                  : "unverified"
                : undefined
            }
            link={{ href: "/account/profile", label: "Change" }}
          />
          <DataRow
            label="Default address"
            value={
              data.user.defaultAddress
                ? `${data.user.defaultAddress.label} — ${data.user.defaultAddress.line1}, ${data.user.defaultAddress.city} ${data.user.defaultAddress.pincode}`
                : "No address yet"
            }
            link={{ href: "/account/addresses", label: "Manage" }}
          />
          <p className="text-xs text-neutral-500">
            Member since {new Date(data.user.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
      )}
    </AccountShell>
  );
}

function DataRow({
  label,
  value,
  badge,
  link,
}: {
  label: string;
  value: string;
  badge?: "verified" | "unverified" | undefined;
  link?: { href: string; label: string } | undefined;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-sm text-neutral-900">{value}</p>
          {badge ? (
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs font-medium " +
                (badge === "verified"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700")
              }
            >
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      {link ? (
        <Link href={link.href} className="text-sm text-neutral-700 underline-offset-2 hover:underline">
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}
