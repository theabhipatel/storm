import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthBootstrapped, useCurrentUser } from "./features/auth/auth.hooks";
import { AuditPage } from "./pages/AuditPage";
import { CatalogBrandsPage } from "./pages/CatalogBrandsPage";
import { CatalogCategoriesPage } from "./pages/CatalogCategoriesPage";
import { CatalogProductFormPage } from "./pages/CatalogProductFormPage";
import { CatalogProductsListPage } from "./pages/CatalogProductsListPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { InventoryAlertsPage } from "./pages/InventoryAlertsPage";
import { InventoryDetailPage } from "./pages/InventoryDetailPage";
import { InventoryListPage } from "./pages/InventoryListPage";
import { LoginPage } from "./pages/LoginPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersListPage } from "./pages/OrdersListPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UsersListPage } from "./pages/UsersListPage";

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
      <Route
        path="/users"
        element={
          <RequireAdmin>
            <UsersListPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/users/:id"
        element={
          <RequireAdmin>
            <UserDetailPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/catalog/products"
        element={
          <RequireAdmin>
            <CatalogProductsListPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/catalog/products/new"
        element={
          <RequireAdmin>
            <CatalogProductFormPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/catalog/products/:id"
        element={
          <RequireAdmin>
            <CatalogProductFormPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/catalog/categories"
        element={
          <RequireAdmin>
            <CatalogCategoriesPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/catalog/brands"
        element={
          <RequireAdmin>
            <CatalogBrandsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/inventory"
        element={
          <RequireAdmin>
            <InventoryListPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/inventory/alerts"
        element={
          <RequireAdmin>
            <InventoryAlertsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/inventory/:sku"
        element={
          <RequireAdmin>
            <InventoryDetailPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/orders"
        element={
          <RequireAdmin>
            <OrdersListPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <RequireAdmin>
            <OrderDetailPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAdmin>
            <NotificationsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/audit"
        element={
          <RequireAdmin>
            <AuditPage />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
