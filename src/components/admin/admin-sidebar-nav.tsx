"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";

const navItems = [
  { href: "/admin", labelKey: "overview", icon: "dashboard" },
  { href: "/admin/levels", labelKey: "levels", icon: "signal_cellular_alt" },
  { href: "/admin/courses", labelKey: "courses", icon: "menu_book" },
  { href: "/admin/certifications", labelKey: "certifications", icon: "workspace_premium" },
  { href: "/admin/enrollments", labelKey: "enrollments", icon: "how_to_reg" },
  { href: "/admin/certificates", labelKey: "certificates", icon: "verified" },
  { href: "/admin/users", labelKey: "users", icon: "group" },
  { href: "/admin/organizations", labelKey: "organizations", icon: "apartment" },
  { href: "/admin/payments", labelKey: "payments", icon: "payments" },
];

export function AdminSidebarNav({
  labels,
  currentPath,
  collapsed = false,
  onNavigate,
}: {
  labels: Record<string, string>;
  currentPath: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-0.5" onClick={onNavigate}>
      {navItems.map((item) => {
        const isActive =
          currentPath === item.href || (item.href !== "/admin" && currentPath.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
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
