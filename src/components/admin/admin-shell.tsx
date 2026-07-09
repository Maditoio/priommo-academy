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

interface AdminShellProps {
  children: React.ReactNode;
  labels: Record<string, string>;
  currentPath: string;
}

export function AdminShell({ children, labels, currentPath }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-bg lg:block">
        <div className="flex h-16 items-center px-6">
          <span className="font-semibold text-ink">{labels.title}</span>
        </div>
        <nav className="space-y-0.5 p-3">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/admin" && currentPath.startsWith(item.href));
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
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">{children}</div>
      </main>
    </div>
  );
}
