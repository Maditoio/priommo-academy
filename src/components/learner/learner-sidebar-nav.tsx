"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";

const navItems = [
  { href: "/dashboard", labelKey: "overview", icon: "dashboard", exact: true },
  { href: "/dashboard/courses", labelKey: "browseCourses", icon: "menu_book" },
  { href: "/dashboard/certificates", labelKey: "certificates", icon: "workspace_premium" },
  { href: "/profile", labelKey: "profile", icon: "manage_accounts" },
  { href: "/dashboard/verify", labelKey: "verify", icon: "verified" },
];

export function LearnerSidebarNav({
  labels,
  showAdmin,
}: {
  labels: Record<string, string>;
  showAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 p-3">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent-soft text-accent"
                : "text-ink-muted hover:bg-surface-hover hover:text-ink"
            )}
          >
            <MaterialIcon name={item.icon} size={20} />
            {labels[item.labelKey]}
          </Link>
        );
      })}
      {showAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <MaterialIcon name="admin_panel_settings" size={20} />
          {labels.admin}
        </Link>
      )}
    </nav>
  );
}
