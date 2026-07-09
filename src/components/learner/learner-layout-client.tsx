"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { MaterialIcon } from "@/components/ui/material-icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { LearnerSidebarNav } from "@/components/learner/learner-sidebar-nav";
import { LearnerMobileNav } from "@/components/learner/learner-mobile-nav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

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
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
            <MaterialIcon name="workspace_premium" className="text-accent" size={18} />
          </div>
          <span className="text-sm font-semibold text-ink">{labels.appName}</span>
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <UserAvatar src={user.imageUrl} name={user.name} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="text-xs text-ink-muted">{labels.learner}</p>
          </div>
        </div>
      )}

      <div onClick={onNavigate}>
        <LearnerSidebarNav labels={labels} showAdmin={user?.role === "ADMIN"} />
      </div>

      <div className="mt-auto space-y-2 border-t border-border p-3">
        <div className="flex justify-center px-2">
          <LanguageSwitcher />
        </div>
        {logoutForm}
      </div>
    </>
  );
}

export function LearnerLayoutClient({
  children,
  labels,
  user,
  logoutForm,
}: LearnerLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface sm:flex">
        <SidebarPanel labels={labels} user={user} logoutForm={logoutForm} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          className="left-0 right-auto flex h-full w-[min(100vw,16rem)] max-w-[16rem] flex-col gap-0 border-r border-border p-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-[16rem]"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">{labels.appName}</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarPanel
              labels={labels}
              user={user}
              logoutForm={logoutForm}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink"
              aria-label="Menu"
            >
              <MaterialIcon name="menu" size={22} />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <MaterialIcon name="workspace_premium" className="text-accent" size={22} />
              <span className="text-sm font-semibold">{labels.appName}</span>
            </Link>
          </div>
          <LanguageSwitcher />
        </header>
        <main className="flex-1 overflow-auto pb-20 sm:pb-0">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
      <LearnerMobileNav labels={labels} />
    </div>
  );
}
