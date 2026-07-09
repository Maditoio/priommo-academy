"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";

const items = [
  { href: "/dashboard", labelKey: "overview", icon: "dashboard", exact: true },
  { href: "/dashboard/courses", labelKey: "browseCourses", icon: "menu_book" },
  { href: "/dashboard/certificates", labelKey: "certificates", icon: "workspace_premium" },
  { href: "/profile", labelKey: "profile", icon: "manage_accounts" },
];

export function LearnerMobileNav({ labels }: { labels: Record<string, string> }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-surface sm:hidden">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.6rem] font-medium",
              active ? "text-accent" : "text-ink-muted"
            )}
          >
            <MaterialIcon name={item.icon} size={22} />
            {labels[item.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}
