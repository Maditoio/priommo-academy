"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { MaterialIcon } from "@/components/ui/material-icon";
import { LearnerSidebarNav } from "@/components/learner/learner-sidebar-nav";
import { LearnerMobileNav } from "@/components/learner/learner-mobile-nav";
import { AccountMenu } from "@/components/shared/account-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { usePersistentBoolean } from "@/hooks/use-persistent-boolean";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSE_KEY = "proimmo:sidebar-collapsed";

interface LearnerLayoutClientProps {
  children: React.ReactNode;
  labels: Record<string, string>;
  user: { name: string; email: string; imageUrl: string | null; role: string } | null;
  locale: string;
}

function SidebarPanel({
  labels,
  user,
  locale,
  collapsed,
  onNavigate,
  onToggleCollapse,
}: {
  labels: Record<string, string>;
  user: LearnerLayoutClientProps["user"];
  locale: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2 px-4 pt-5", collapsed && "flex-col px-2")}>
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-2 transition-colors duration-150 hover:bg-surface-hover",
            collapsed && "flex-none justify-center px-0"
          )}
          onClick={onNavigate}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl accent-gradient shadow-sm">
            <MaterialIcon name="workspace_premium" className="text-white" size={20} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{labels.appName}</p>
              <p className="truncate text-xs text-ink-muted">{labels.workspace}</p>
            </div>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? labels.expandSidebar : labels.collapseSidebar}
            title={collapsed ? labels.expandSidebar : labels.collapseSidebar}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted/60 transition-colors duration-150 hover:bg-surface-hover hover:text-ink",
              collapsed && "mt-1"
            )}
          >
            <MaterialIcon name={collapsed ? "chevron_right" : "chevron_left"} size={18} />
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-3 py-2">
        <LearnerSidebarNav
          labels={labels}
          showAdmin={user?.role === "ADMIN"}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </div>

      {user && (
        <div className="border-t border-border/60 p-3">
          <AccountMenu
            user={user}
            roleLabel={labels.learner}
            locale={locale}
            collapsed={collapsed}
            side={collapsed ? "right" : "top"}
            links={
              user.role === "ADMIN"
                ? [{ href: "/admin", label: labels.adminPanel, icon: "admin_panel_settings" }]
                : []
            }
            labels={{ language: labels.language, logout: labels.logout }}
          />
        </div>
      )}
    </div>
  );
}

export function LearnerLayoutClient({ children, labels, user, locale }: LearnerLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = usePersistentBoolean(SIDEBAR_COLLAPSE_KEY);
  const pathname = usePathname();
  const isExam = pathname.includes("/dashboard/exams/");

  return (
    <div className="flex min-h-screen bg-bg">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col bg-bg transition-[width] duration-200 ease-out sm:flex",
          collapsed ? "w-[4.75rem]" : "w-[17rem]"
        )}
      >
        <SidebarPanel
          labels={labels}
          user={user}
          locale={locale}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          className="left-0 right-auto flex h-full w-[min(100vw,17rem)] max-w-[17rem] flex-col gap-0 border-r border-border bg-bg p-0 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 sm:max-w-[17rem]"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">{labels.appName}</SheetTitle>
          <SidebarPanel
            labels={labels}
            user={user}
            locale={locale}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border/60 bg-surface/80 px-4 backdrop-blur-sm sm:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition-colors duration-150 hover:bg-surface-hover hover:text-ink"
              aria-label="Menu"
            >
              <MaterialIcon name="menu" size={22} />
            </button>
            <Link href="/dashboard" className="text-sm font-semibold text-ink">
              {labels.appName}
            </Link>
          </div>
        </header>
        <main className={cn("flex-1 overflow-auto", !isExam && "pb-20 sm:pb-0")}>
          {isExam ? (
            children
          ) : (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
          )}
        </main>
      </div>
      {!isExam && <LearnerMobileNav labels={labels} />}
    </div>
  );
}
