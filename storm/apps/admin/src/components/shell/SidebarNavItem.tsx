import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export function SidebarNavItem({
  to,
  label,
  icon: Icon,
  end,
  trailing,
}: {
  to: string;
  label: ReactNode;
  icon: LucideIcon;
  end?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      {...(end ? { end: true } : {})}
      className={({ isActive }) =>
        "group flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition " +
        (isActive
          ? "border-primary bg-primary-soft text-primary"
          : "border-transparent text-text-muted hover:bg-surface-muted hover:text-text")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={
              "h-4 w-4 flex-shrink-0 " +
              (isActive ? "text-primary" : "text-text-subtle group-hover:text-text")
            }
            aria-hidden
          />
          <span className="truncate">{label}</span>
          {trailing ? <span className="ml-auto">{trailing}</span> : null}
        </>
      )}
    </NavLink>
  );
}

export function SidebarSubNavItem({
  to,
  label,
  end,
}: {
  to: string;
  label: ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      {...(end ? { end: true } : {})}
      className={({ isActive }) =>
        "flex items-center gap-2 rounded-md border-l-2 py-1.5 pl-9 pr-3 text-sm transition " +
        (isActive
          ? "border-primary bg-primary-soft font-medium text-primary"
          : "border-transparent text-text-muted hover:bg-surface-muted hover:text-text")
      }
    >
      {label}
    </NavLink>
  );
}
