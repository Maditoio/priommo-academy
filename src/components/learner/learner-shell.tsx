import { Link } from "@/i18n/routing";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { MaterialIcon } from "@/components/ui/material-icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { LearnerSidebarNav } from "@/components/learner/learner-sidebar-nav";
import { LearnerMobileNav } from "@/components/learner/learner-mobile-nav";

interface LearnerShellProps {
  children: React.ReactNode;
  labels: Record<string, string>;
  locale: string;
}

export async function LearnerShell({ children, labels, locale }: LearnerShellProps) {
  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, imageUrl: true, role: true },
      })
    : null;

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2.5">
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

        <LearnerSidebarNav labels={labels} showAdmin={user?.role === "ADMIN"} />

        <div className="space-y-2 border-t border-border p-3">
          <div className="flex justify-center px-2">
            <LanguageSwitcher />
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: `/${locale}` });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <MaterialIcon name="logout" size={20} />
              {labels.logout}
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <MaterialIcon name="workspace_premium" className="text-accent" size={22} />
            <span className="text-sm font-semibold">{labels.appName}</span>
          </Link>
          <LanguageSwitcher />
        </header>
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
      <LearnerMobileNav labels={labels} />
    </div>
  );
}
