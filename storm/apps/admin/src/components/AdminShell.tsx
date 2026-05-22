import type { ReactNode } from "react";

import { AdminShell as Shell } from "./shell/AdminShell";
import { PageHeader } from "./shell/PageHeader";

export function AdminShell({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Shell>
      {title ? <PageHeader title={title} /> : null}
      {children}
    </Shell>
  );
}
