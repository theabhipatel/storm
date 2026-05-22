import { Ban, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { BlockUserDialog } from "../components/BlockUserDialog";
import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import {
  useBlockUserMutation,
  useGetUserQuery,
  useUnblockUserMutation,
} from "../features/users/users.api";

export function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const { data, isLoading } = useGetUserQuery(id, { skip: !id });
  const [blockUser, blockState] = useBlockUserMutation();
  const [unblockUser, unblockState] = useUnblockUserMutation();
  const [showBlock, setShowBlock] = useState(false);

  if (!id) return null;

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[
          { label: "Users", to: "/users" },
          { label: data?.user.email ?? "Detail" },
        ]}
        title={data?.user.name ?? "User detail"}
        subtitle={data?.user.email}
        actions={
          data?.user ? (
            data.user.blocked ? (
              <Button
                variant="primary"
                disabled={unblockState.isLoading}
                onClick={() => unblockUser({ id })}
                leadingIcon={<ShieldCheck className="h-4 w-4" aria-hidden />}
              >
                {unblockState.isLoading ? "Unblocking…" : "Unblock"}
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={() => setShowBlock(true)}
                leadingIcon={<Ban className="h-4 w-4" aria-hidden />}
              >
                Block
              </Button>
            )
          ) : null
        }
      />

      {isLoading || !data ? (
        <p className="text-sm text-text-subtle">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card padding="lg">
              <CardHeader title="Profile" />
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                    Name
                  </dt>
                  <dd className="text-text">{data.user.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                    Email
                  </dt>
                  <dd className="text-text">{data.user.email}</dd>
                </div>
                {data.user.mobile && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                      Mobile
                    </dt>
                    <dd className="text-text">+91 {data.user.mobile}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                    Member since
                  </dt>
                  <dd className="text-text">
                    {new Date(data.user.createdAt).toLocaleString("en-IN")}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={data.user.role === "admin" ? "soft-primary" : "neutral"} size="sm">
                  {data.user.role}
                </Badge>
                <Badge variant={data.user.blocked ? "soft-danger" : "soft-success"} size="sm">
                  {data.user.blocked ? "Blocked" : "Active"}
                </Badge>
                <Badge
                  variant={data.user.emailVerified ? "soft-success" : "neutral"}
                  size="sm"
                >
                  email {data.user.emailVerified ? "verified" : "unverified"}
                </Badge>
                {data.user.mobile && (
                  <Badge
                    variant={data.user.mobileVerified ? "soft-success" : "neutral"}
                    size="sm"
                  >
                    mobile {data.user.mobileVerified ? "verified" : "unverified"}
                  </Badge>
                )}
              </div>
            </Card>

            <Card padding="lg">
              <CardHeader title="Recent profile changes" />
              {data.profileChanges.length === 0 ? (
                <p className="text-sm text-text-subtle">None</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {data.profileChanges.map((c) => (
                    <li key={c.id} className="py-2">
                      <div className="text-text">
                        <span className="font-medium">{c.field}</span>{" "}
                        <span className="text-text-subtle">
                          {c.oldValue ?? "—"} → {c.newValue ?? "—"}
                        </span>
                      </div>
                      <div className="text-xs text-text-subtle">
                        {new Date(c.changedAt).toLocaleString("en-IN")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card padding="lg">
              <CardHeader title="Admin audit log" />
              {data.auditLog.length === 0 ? (
                <p className="text-sm text-text-subtle">None</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {data.auditLog.map((a) => (
                    <li key={a.id} className="py-2">
                      <div className="text-text">
                        <span className="font-medium">{a.action}</span>{" "}
                        <span className="text-xs text-text-subtle">
                          by {a.actorId ?? "system"}
                        </span>
                      </div>
                      <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-text-subtle">
                        {JSON.stringify(a.metadata, null, 0)}
                      </pre>
                      <div className="text-xs text-text-subtle">
                        {new Date(a.createdAt).toLocaleString("en-IN")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card padding="lg">
              <CardHeader title={`Addresses (${data.addresses.length})`} />
              {data.addresses.length === 0 ? (
                <p className="text-sm text-text-subtle">None</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.addresses.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-md border border-border bg-surface-muted p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">{a.label}</span>
                        {a.isDefault ? (
                          <Badge variant="soft-success" size="sm">
                            Default
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-text">
                        {a.fullName} • +91 {a.mobile}
                      </p>
                      <p className="text-text-muted">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      <BlockUserDialog
        open={showBlock}
        userEmail={data?.user.email ?? ""}
        isLoading={blockState.isLoading}
        error={blockState.error as { code?: string; message?: string } | undefined}
        onCancel={() => setShowBlock(false)}
        onConfirm={async (reason) => {
          try {
            await blockUser({ id, reason }).unwrap();
            setShowBlock(false);
          } catch {
            /* surfaced */
          }
        }}
      />
    </AdminShell>
  );
}
