"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { MaterialIcon } from "@/components/ui/material-icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { LearnerSidebarNav } from "@/components/learner/learner-sidebar-nav";
import { LearnerMobileNav } from "@/components/learner/learner-mobile-nav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface LearnerLayoutClientProps {
  children: React.ReactNode;
  labels: Record<string, string>;
  user: { name: string; imageUrl: string | null; role: string } | null;
  logoutForm: React.ReactNode;
}

function SidebarPanel({
  labels,
  user,
  logoutForm,
  onNavigate,
}: {
  labels: Record<string, string>;
  user: LearnerLayoutClientProps["user"];
  logoutForm: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-surface-hover"
          onClick={onNavigate}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient shadow-sm">
            <MaterialIcon name="workspace_premium" className="text-white" size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{labels.appName}</p>
            <p className="text-xs text-ink-muted">{labels.workspace}</p>
          </div>
        </Link>
      </div>

      {user && (
        <div className="mx-4 mt-4 rounded-2xl bg-accent-soft/60 p-3">
          <div className="flex items-center gap-3">
            <UserAvatar src={user.imageUrl} name={user.name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="text-xs text-ink-muted">{labels.learner}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 flex-1 overflow-y-auto px-3 py-4" onClick={onNavigate}>
        <LearnerSidebarNav labels={labels} showAdmin={user?.role === "ADMIN"} />
      </div>

      <div className="space-y-2 border-t border-border/60 p-3">
        <div className="flex justify-center px-2">
          <LanguageSwitcher />
        </div>
        {logoutForm}
      </div>
    </div>
  );
}

export function LearnerLayoutClient({
  children,
  labels,
  user,
  logoutForm,
}: LearnerLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isExam = pathname.includes("/dashboard/exams/");

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col bg-bg sm:flex">
        <SidebarPanel labels={labels} user={user} logoutForm={logoutForm} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          className="left-0 right-auto flex h-full w-[min(100vw,17rem)] max-w-[17rem] flex-col gap-0 border-r border-border bg-bg p-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-[17rem]"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">{labels.appName}</SheetTitle>
          <SidebarPanel
            labels={labels}
            user={user}
            logoutForm={logoutForm}
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
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-hover hover:text-ink"
              aria-label="Menu"
            >
              <MaterialIcon name="menu" size={22} />
            </button>
            <Link href="/dashboard" className="text-sm font-semibold text-ink">
              {labels.appName}
            </Link>
          </div>
          <LanguageSwitcher />
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
