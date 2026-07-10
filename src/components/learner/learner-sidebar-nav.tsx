"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";

const navItems = [
  { href: "/dashboard", labelKey: "overview", icon: "dashboard", exact: true },
  { href: "/dashboard/courses", labelKey: "browseCourses", icon: "menu_book" },
  { href: "/dashboard/certificates", labelKey: "certificates", icon: "workspace_premium" },
  { href: "/dashboard/verify", labelKey: "verify", icon: "verified" },
  { href: "/profile", labelKey: "profile", icon: "manage_accounts" },
];

export function LearnerSidebarNav({
  labels,
  showAdmin,
  collapsed = false,
  onNavigate,
}: {
  labels: Record<string, string>;
  showAdmin: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const allItems = showAdmin
    ? [...navItems, { href: "/admin", labelKey: "admin", icon: "admin_panel_settings" }]
    : navItems;

  return (
    <nav className="space-y-0.5">
      {allItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? labels[item.labelKey] : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors duration-150",
              collapsed ? "justify-center px-0" : "px-3",
              isActive ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-surface-hover hover:text-ink"
            )}
          >
            {isActive && !collapsed && (
              <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-accent" />
            )}
            <MaterialIcon name={item.icon} size={19} className="shrink-0" />
            {!collapsed && <span className="truncate">{labels[item.labelKey]}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
