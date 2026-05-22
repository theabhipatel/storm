import { LogOut } from "lucide-react";

import { useCurrentUser, useLogout } from "../../features/auth/auth.hooks";

function initials(name?: string | null): string {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "A";
}

export function SidebarUserFooter() {
  const user = useCurrentUser();
  const [logout, { isLoading }] = useLogout();
  return (
    <div className="border-t border-border px-3 py-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-2">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials(user?.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-text">{user?.name}</div>
          <div className="truncate text-xs text-text-subtle">{user?.email}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        disabled={isLoading}
        className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted transition hover:bg-surface-muted hover:text-text disabled:opacity-50"
      >
        <LogOut className="h-4 w-4 text-text-subtle" aria-hidden />
        {isLoading ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
