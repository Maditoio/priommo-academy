import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
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

  const [enrollments, certificates] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: session.user.id },
      include: { course: true },
      orderBy: { enrolledAt: "desc" },
    }),
    db.certificateIssued.findMany({
      where: { userId: session.user.id },
      include: { certification: { include: { level: true } } },
      orderBy: { issuedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-semibold text-ink">{t("myEnrollments")}</h1>
        {enrollments.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-snug">
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
                    {format(enrollment.enrolledAt, "PP", { locale: dateLocale })}
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/dashboard/enrollments/${enrollment.id}`}>{t("takeExam")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-5 border-dashed shadow-sm">
            <CardContent className="flex flex-col items-center py-10 text-center">
              <MaterialIcon name="menu_book" className="text-ink-muted/40" size={40} />
              <p className="mt-3 text-ink-muted">{t("noEnrollments")}</p>
              <Button asChild className="mt-4" variant="secondary">
                <Link href="/courses">{t("browseCourses")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-ink">{t("myCertificates")}</h2>
          {certificates.length > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/certificates">{t("viewAll")}</Link>
            </Button>
          )}
        </div>
        {certificates.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="shadow-sm">
                <CardContent className="flex flex-col items-center pt-6 text-center">
                  <VerificationSeal
                    status={sealStatusFromCertificate(cert.status)}
                    code={cert.uniqueCode}
                    level={levelName(cert.certification.level, locale)}
                    size="sm"
                  />
                  <p className="mt-4 text-sm font-semibold text-ink line-clamp-2">
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
          <p className="mt-4 text-sm text-ink-muted">{t("noCertificates")}</p>
        )}
      </section>
    </div>
  );
}
