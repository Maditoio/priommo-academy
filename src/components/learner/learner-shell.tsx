import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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
        select: { name: true, email: true, imageUrl: true, role: true },
      })
    : null;

  return (
    <LearnerLayoutClient labels={labels} user={user} locale={locale}>
      {children}
    </LearnerLayoutClient>
  );
}
