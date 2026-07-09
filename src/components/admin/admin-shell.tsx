import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  Building2,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
} from "lucide-react";

const navItems = [
  { href: "/admin", labelKey: "overview", icon: LayoutDashboard },
  { href: "/admin/courses", labelKey: "courses", icon: BookOpen },
  { href: "/admin/certifications", labelKey: "certifications", icon: Award },
  { href: "/admin/enrollments", labelKey: "enrollments", icon: UserCheck },
  { href: "/admin/certificates", labelKey: "certificates", icon: GraduationCap },
  { href: "/admin/users", labelKey: "users", icon: Users },
  { href: "/admin/organizations", labelKey: "organizations", icon: Building2 },
  { href: "/admin/payments", labelKey: "payments", icon: CreditCard },
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
            const Icon = item.icon;
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
                <Icon className="h-4 w-4 shrink-0" />
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
