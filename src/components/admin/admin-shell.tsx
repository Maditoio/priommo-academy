import { Link } from "@/i18n/routing";
import { auth, signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { getTranslations } from "next-intl/server";

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
  locale: string;
}

export async function AdminShell({ children, labels, currentPath, locale }: AdminShellProps) {
  const t = await getTranslations("nav");
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col bg-bg lg:flex">
        <div className="px-4 pt-5">
          <Link href="/admin" className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-surface-hover">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient shadow-sm">
              <MaterialIcon name="admin_panel_settings" className="text-white" size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{labels.title}</p>
              <p className="text-xs text-ink-muted">PROIMMO Academy</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/admin" && currentPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent-soft text-accent shadow-sm"
                    : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200",
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
        </nav>

        <div className="space-y-2 border-t border-border/60 p-3">
          <div className="flex justify-center px-2">
            <LanguageSwitcher />
          </div>
          {session?.user && (
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:bg-surface-hover hover:text-ink"
            >
              <MaterialIcon name="dashboard" size={20} />
              {t("dashboard")}
            </Link>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: `/${locale}` });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:bg-surface-hover hover:text-ink"
            >
              <MaterialIcon name="logout" size={20} />
              {t("logout")}
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border/60 bg-surface/80 px-4 backdrop-blur-sm lg:hidden">
          <Link href="/admin" className="text-sm font-semibold text-ink">
            {labels.title}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: `/${locale}` });
              }}
            >
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-hover hover:text-ink"
                aria-label={t("logout")}
              >
                <MaterialIcon name="logout" size={20} />
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
