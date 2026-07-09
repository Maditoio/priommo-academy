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
    <div className="flex min-h-screen bg-paper">
      <aside className="hidden w-64 shrink-0 border-r border-navy/10 bg-navy lg:block">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <span className="font-display font-semibold text-white">{labels.title}</span>
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
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-navy-light text-white after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-gold"
                    : "text-white/70 hover:bg-navy-light/50 hover:text-white"
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
