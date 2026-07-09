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
    learner: td("learnerSpace"),
    overview: td("overview"),
    certificates: td("myCertificates"),
    profile: t("profile"),
    browseCourses: td("browseCourses"),
    verify: t("verify"),
    admin: t("admin"),
    logout: t("logout"),
  };

  return (
    <LearnerShell locale={locale} labels={labels}>
      {children}
    </LearnerShell>
  );
}
