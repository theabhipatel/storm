import { useLogout, useCurrentUser } from "../features/auth/auth.hooks";

export function DashboardPage() {
  const user = useCurrentUser();
  const [logout, { isLoading }] = useLogout();

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              Storm Admin
            </div>
            <h1 className="text-lg font-semibold text-neutral-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <div className="font-medium text-neutral-900">{user?.name}</div>
              <div className="text-xs text-neutral-500">{user?.email}</div>
            </div>
            <button
              onClick={() => void logout()}
              disabled={isLoading}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
            >
              {isLoading ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">Welcome</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Admin tools land here on Day 9. For now this is a placeholder confirming the
            authentication wiring is working end-to-end.
          </p>
        </div>
      </section>
    </main>
  );
}
