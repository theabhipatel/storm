import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthBootstrapped, useCurrentUser } from "./features/auth/auth.hooks";
import { DashboardPage } from "./pages/DashboardPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

function RequireAdmin({ children }: { children: ReactNode }) {
  const bootstrapped = useAuthBootstrapped();
  const user = useCurrentUser();
  if (!bootstrapped) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 text-sm text-neutral-600">
        Loading session...
      </main>
    );
  }
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const bootstrapped = useAuthBootstrapped();
  const user = useCurrentUser();
  if (bootstrapped && user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAdmin>
            <DashboardPage />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
