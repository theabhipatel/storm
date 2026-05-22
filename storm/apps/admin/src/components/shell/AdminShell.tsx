import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="pl-60">
        <main className="mx-auto max-w-content px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
