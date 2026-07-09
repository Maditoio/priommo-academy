"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";

const navGroups = [
  {
    labelKey: "learning",
    items: [
      { href: "/dashboard", labelKey: "overview", icon: "dashboard", exact: true },
      { href: "/dashboard/courses", labelKey: "browseCourses", icon: "menu_book" },
      { href: "/dashboard/certificates", labelKey: "certificates", icon: "workspace_premium" },
    ],
  },
  {
    labelKey: "account",
    items: [
      { href: "/profile", labelKey: "profile", icon: "manage_accounts" },
      { href: "/dashboard/verify", labelKey: "verify", icon: "verified" },
    ],
  },
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
    <nav className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.labelKey}>
          <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-widest text-ink-muted/80">
            {labels[group.labelKey]}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-accent-soft text-accent shadow-sm"
                      : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-white/80 text-accent"
                        : "bg-surface text-ink-muted group-hover:bg-white"
                    )}
                  >
                    <MaterialIcon name={item.icon} size={18} />
                  </span>
                  {labels[item.labelKey]}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
      {showAdmin && (
        <div>
          <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-widest text-ink-muted/80">
            {labels.adminSection}
          </p>
          <Link
            href="/admin"
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-all hover:bg-surface-hover hover:text-ink"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface group-hover:bg-white">
              <MaterialIcon name="admin_panel_settings" size={18} />
            </span>
            {labels.admin}
          </Link>
        </div>
      )}
    </nav>
  );
}
