import { ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export function SidebarNavGroup({
  label,
  icon: Icon,
  basePaths,
  children,
}: {
  label: ReactNode;
  icon: LucideIcon;
  basePaths: string[];
  children: ReactNode;
}) {
  const location = useLocation();
  const isActiveSection = basePaths.some((p) =>
    location.pathname === p || location.pathname.startsWith(p + "/"),
  );
  const [open, setOpen] = useState(isActiveSection);

  useEffect(() => {
    if (isActiveSection) setOpen(true);
  }, [isActiveSection]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={
          "flex w-full items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition " +
          (isActiveSection
            ? "border-transparent text-text"
            : "border-transparent text-text-muted hover:bg-surface-muted hover:text-text")
        }
      >
        <Icon
          className={
            "h-4 w-4 flex-shrink-0 " +
            (isActiveSection ? "text-primary" : "text-text-subtle")
          }
          aria-hidden
        />
        <span className="truncate">{label}</span>
        <ChevronDown
          className={"ml-auto h-3.5 w-3.5 transition " + (open ? "rotate-180" : "")}
          aria-hidden
        />
      </button>
      {open ? <div className="mt-0.5 space-y-0.5">{children}</div> : null}
    </div>
  );
}
