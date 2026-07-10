import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";

interface AdminShellProps {
  children: React.ReactNode;
  labels: Record<string, string>;
  currentPath: string;
  locale: string;
}

export async function AdminShell({ children, labels, currentPath, locale }: AdminShellProps) {
  const t = await getTranslations("nav");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");
  const session = await auth();

  const user = session?.user?.id
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, imageUrl: true },
      })
    : null;

  const shellLabels: Record<string, string> = {
    ...labels,
    appName: tc("appName"),
    logout: t("logout"),
    language: td("language"),
    learnerDashboard: td("learnerDashboard"),
    collapseSidebar: td("collapseSidebar"),
    expandSidebar: td("expandSidebar"),
  };

  return (
    <AdminLayoutClient
      labels={shellLabels}
      currentPath={currentPath}
      locale={locale}
      user={user}
      roleLabel={t("admin")}
    >
      {children}
    </AdminLayoutClient>
  );
}
