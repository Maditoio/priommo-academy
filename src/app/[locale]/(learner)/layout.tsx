import { auth } from "@/lib/auth";
import { LearnerShell } from "@/components/learner/learner-shell";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function LearnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("nav");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const labels = {
    appName: tc("appName"),
    workspace: td("workspace"),
    learner: td("learnerSpace"),
    learning: td("navLearning"),
    account: td("navAccount"),
    adminSection: td("navAdmin"),
    overview: td("overview"),
    certificates: td("myCertificates"),
    profile: t("profile"),
    browseCourses: td("browseCourses"),
    verify: t("verify"),
    admin: t("admin"),
    adminPanel: td("adminPanel"),
    logout: t("logout"),
    language: td("language"),
    collapseSidebar: td("collapseSidebar"),
    expandSidebar: td("expandSidebar"),
  };

  return (
    <LearnerShell locale={locale} labels={labels}>
      {children}
    </LearnerShell>
  );
}
