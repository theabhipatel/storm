import {
  Bell,
  Boxes,
  LayoutDashboard,
  ScrollText,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SidebarNavGroup } from "./SidebarNavGroup";
import { SidebarNavItem, SidebarSubNavItem } from "./SidebarNavItem";
import { SidebarUserFooter } from "./SidebarUserFooter";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-surface">
      <div className="flex h-16 flex-shrink-0 items-center border-b border-border px-5">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-base font-semibold text-text"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="h-5 w-5" aria-hidden />
          </span>
          Storm Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <SidebarNavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} />

        <SidebarNavGroup
          label="Catalog"
          icon={Boxes}
          basePaths={["/catalog/products", "/catalog/categories", "/catalog/brands"]}
        >
          <SidebarSubNavItem to="/catalog/products" label="Products" />
          <SidebarSubNavItem to="/catalog/categories" label="Categories" />
          <SidebarSubNavItem to="/catalog/brands" label="Brands" />
        </SidebarNavGroup>

        <SidebarNavGroup
          label="Inventory"
          icon={Warehouse}
          basePaths={["/inventory"]}
        >
          <SidebarSubNavItem to="/inventory" label="Stock list" end />
          <SidebarSubNavItem to="/inventory/alerts" label="Low-stock alerts" />
        </SidebarNavGroup>

        <SidebarNavItem to="/orders" label="Orders" icon={ShoppingBag} />
        <SidebarNavItem to="/users" label="Users" icon={Users} />
        <SidebarNavItem to="/notifications" label="Notifications" icon={Bell} />
        <SidebarNavItem to="/audit" label="Audit log" icon={ScrollText} />
      </nav>
      <SidebarUserFooter />
    </aside>
  );
}
