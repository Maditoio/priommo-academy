import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { MaterialIcon } from "@/components/ui/material-icon";
import { LearnerLayoutClient } from "@/components/learner/learner-layout-client";

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

  const logoutForm = (
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
  );

  return (
    <LearnerLayoutClient labels={labels} user={user} logoutForm={logoutForm}>
      {children}
    </LearnerLayoutClient>
  );
}
