"use client";

import { Check, ChevronRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AccountShell } from "../../components/domain/AccountShell";
import { Badge } from "../../components/ui/Badge";
import { useMeProfileQuery } from "../../features/account/account.api";

export default function AccountOverviewPage() {
  const { data, isLoading } = useMeProfileQuery();

  return (
    <AccountShell title="Account overview">
      {isLoading || !data ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <div className="divide-y divide-border">
          <DataRow label="Name" value={data.user.name} link={{ href: "/account/profile", label: "Edit" }} />
          <DataRow
            label="Email"
            value={data.user.email}
            badge={
              data.user.emailVerified ? (
                <Badge variant="success" size="sm" leadingIcon={<Check className="h-3 w-3" />}>
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning" size="sm" leadingIcon={<ShieldAlert className="h-3 w-3" />}>
                  Unverified
                </Badge>
              )
            }
            link={{ href: "/account/profile", label: "Change" }}
          />
          <DataRow
            label="Mobile"
            value={data.user.mobile ? `+91 ${data.user.mobile}` : "Not set"}
            badge={
              data.user.mobile ? (
                data.user.mobileVerified ? (
                  <Badge variant="success" size="sm" leadingIcon={<Check className="h-3 w-3" />}>
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Unverified
                  </Badge>
                )
              ) : null
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
          <div className="pt-4">
            <p className="text-xs text-text-subtle">
              Member since {new Date(data.user.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
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
  badge?: ReactNode;
  link?: { href: string; label: string } | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
          {label}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="break-words text-sm text-text">{value}</p>
          {badge}
        </div>
      </div>
      {link ? (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          {link.label}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
