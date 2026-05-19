import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { BlockUserDialog } from "../components/BlockUserDialog";
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
    <AdminShell title="User detail">
      <Link
        to="/users"
        className="mb-4 inline-block text-sm text-neutral-600 underline-offset-2 hover:underline"
      >
        ← Back to users
      </Link>
      {isLoading || !data ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">User</p>
                <h2 className="text-lg font-semibold text-neutral-900">{data.user.name}</h2>
                <p className="text-sm text-neutral-600">{data.user.email}</p>
                {data.user.mobile ? (
                  <p className="text-sm text-neutral-600">+91 {data.user.mobile}</p>
                ) : null}
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700">
                    {data.user.role}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 " +
                      (data.user.blocked
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700")
                    }
                  >
                    {data.user.blocked ? "Blocked" : "Active"}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700">
                    email {data.user.emailVerified ? "verified" : "unverified"}
                  </span>
                  {data.user.mobile ? (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700">
                      mobile {data.user.mobileVerified ? "verified" : "unverified"}
                    </span>
                  ) : null}
                </div>
              </div>
              <div>
                {data.user.blocked ? (
                  <button
                    type="button"
                    disabled={unblockState.isLoading}
                    onClick={() => unblockUser({ id })}
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {unblockState.isLoading ? "Unblocking…" : "Unblock"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowBlock(true)}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                  >
                    Block
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Member since {new Date(data.user.createdAt).toLocaleString("en-IN")}
            </p>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">
              Addresses ({data.addresses.length})
            </h3>
            {data.addresses.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">None</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {data.addresses.map((a) => (
                  <li key={a.id} className="rounded border border-neutral-100 p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{a.label}</span>
                      {a.isDefault ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="text-neutral-700">{a.fullName} • +91 {a.mobile}</p>
                    <p className="text-neutral-600">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">Recent profile changes</h3>
            {data.profileChanges.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">None</p>
            ) : (
              <ul className="mt-2 divide-y divide-neutral-100 text-sm">
                {data.profileChanges.map((c) => (
                  <li key={c.id} className="py-2">
                    <div className="text-neutral-800">
                      <span className="font-medium">{c.field}</span>{" "}
                      <span className="text-neutral-500">
                        {c.oldValue ?? "—"} → {c.newValue ?? "—"}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {new Date(c.changedAt).toLocaleString("en-IN")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">Admin audit log</h3>
            {data.auditLog.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">None</p>
            ) : (
              <ul className="mt-2 divide-y divide-neutral-100 text-sm">
                {data.auditLog.map((a) => (
                  <li key={a.id} className="py-2">
                    <div className="text-neutral-800">
                      <span className="font-medium">{a.action}</span>{" "}
                      <span className="text-xs text-neutral-500">
                        by {a.actorId ?? "system"}
                      </span>
                    </div>
                    <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-neutral-500">
                      {JSON.stringify(a.metadata, null, 0)}
                    </pre>
                    <div className="text-xs text-neutral-500">
                      {new Date(a.createdAt).toLocaleString("en-IN")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
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
