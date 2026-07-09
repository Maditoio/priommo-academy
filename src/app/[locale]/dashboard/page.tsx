import { db } from "@/lib/db";
import { auth, signOut } from "@/lib/auth";
import { Link } from "@/i18n/routing";
import { StatusBadge } from "@/components/public/status-badge";
import { VerificationSeal, sealStatusFromCertificate } from "@/components/public/verification-seal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { localizedField } from "@/lib/utils";
import { levelName } from "@/lib/levels";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { UserAvatar } from "@/components/ui/user-avatar";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("dashboard");
  const ts = await getTranslations("status");
  const dateLocale = locale === "fr" ? fr : enUS;

  const [user, enrollments, certificates] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true, imageUrl: true },
    }),
    db.enrollment.findMany({
      where: { userId: session.user.id },
      include: { course: true },
      orderBy: { enrolledAt: "desc" },
    }),
    db.certificateIssued.findMany({
      where: { userId: session.user.id },
      include: { certification: { include: { level: true } } },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar src={user.imageUrl} name={user.name} size={56} />
          <div>
            <h1 className="text-[1.875rem] font-semibold text-ink">{t("title")}</h1>
            <p className="text-ink-muted">{user.name}</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/profile">
                <MaterialIcon name="manage_accounts" size={18} />
                {locale === "fr" ? "Profil" : "Profile"}
              </Link>
            </Button>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: `/${locale}` });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                <MaterialIcon name="logout" size={18} />
                {locale === "fr" ? "Déconnexion" : "Log out"}
              </Button>
            </form>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
            <MaterialIcon name="menu_book" className="text-accent" size={22} />
            {t("myEnrollments")}
          </h2>
          {enrollments.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {localizedField(enrollment.course, "title", locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <StatusBadge status={enrollment.status} label={ts(enrollment.status)} />
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-ink-muted">{t("progress")}</span>
                        <span className="font-medium">{enrollment.progressPct}%</span>
                      </div>
                      <Progress value={enrollment.progressPct} />
                    </div>
                    <p className="text-xs text-ink-muted">
                      {t("enrolledAt")}: {format(enrollment.enrolledAt, "PP", { locale: dateLocale })}
                    </p>
                    <Button asChild size="sm" variant="secondary" className="w-full">
                      <Link href={`/dashboard/enrollments/${enrollment.id}`}>{t("takeExam")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-ink-muted">{t("noEnrollments")}</p>
          )}
        </section>

        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
            <MaterialIcon name="workspace_premium" className="text-accent" size={22} />
            {t("myCertificates")}
          </h2>
          {certificates.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <Card key={cert.id} className="shadow-sm">
                  <CardContent className="flex flex-col items-center pt-6 text-center">
                    <VerificationSeal
                      status={sealStatusFromCertificate(cert.status)}
                      code={cert.uniqueCode}
                      level={levelName(cert.certification.level, locale)}
                      size="sm"
                    />
                    <p className="mt-4 font-semibold text-ink">
                      {localizedField(cert.certification, "title", locale)}
                    </p>
                    <StatusBadge status={cert.status} label={ts(cert.status)} className="mt-2" />
                    <Button asChild size="sm" variant="secondary" className="mt-4 w-full">
                      <Link href={`/verify/${cert.uniqueCode}`}>{t("viewCertificate")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-ink-muted">{t("noCertificates")}</p>
          )}
        </section>
      </div>
    </div>
  );
}
