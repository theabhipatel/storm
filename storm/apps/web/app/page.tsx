"use client";

import {
  useAuthBootstrapped,
  useCurrentUser,
  useLogout,
} from "../features/auth/auth.hooks";

export default function HomePage() {
  const bootstrapped = useAuthBootstrapped();
  const user = useCurrentUser();
  const [logout, { isLoading: logoutLoading }] = useLogout();

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">Storm</h1>
        <p className="mt-2 text-neutral-600">coming soon</p>

        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-left shadow-sm">
          {!bootstrapped ? (
            <p className="text-sm text-neutral-600">Loading session...</p>
          ) : user ? (
            <>
              <p className="text-sm text-neutral-600">Signed in as</p>
              <p className="mt-1 text-base font-medium text-neutral-900">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.email}</p>
              <p className="mt-2 text-xs text-neutral-500">role: {user.role}</p>
              <div className="mt-4 flex gap-2">
                <a
                  className="text-sm font-medium text-neutral-900 underline"
                  href="/account/change-password"
                >
                  Change password
                </a>
                <button
                  className="ml-auto text-sm font-medium text-neutral-900 underline disabled:opacity-50"
                  onClick={() => void logout()}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <a
                href="/auth/login"
                className="flex-1 rounded-md bg-neutral-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-neutral-800"
              >
                Log in
              </a>
              <a
                href="/auth/signup"
                className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                Sign up
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
