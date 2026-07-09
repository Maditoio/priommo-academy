import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/routing";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { localizedField } from "@/lib/utils";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Award, BookOpen } from "lucide-react";

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
      include: { certification: true },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h1 className="text-3xl font-bold">{t("title")}</h1>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <BookOpen className="h-5 w-5" />
            {t("myEnrollments")}
          </h2>
          {enrollments.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {localizedField(enrollment.course, "title", locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <StatusBadge status={enrollment.status} label={ts(enrollment.status)} />
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("progress")}</span>
                        <span>{enrollment.progressPct}%</span>
                      </div>
                      <Progress value={enrollment.progressPct} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("enrolledAt")}: {format(enrollment.enrolledAt, "PP", { locale: dateLocale })}
                    </p>
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`/dashboard/enrollments/${enrollment.id}`}>
                        {t("takeExam")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-muted-foreground">{t("noEnrollments")}</p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Award className="h-5 w-5" />
            {t("myCertificates")}
          </h2>
          {certificates.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="pt-6">
                    <StatusBadge status={cert.status} label={ts(cert.status)} />
                    <p className="mt-2 font-medium">
                      {localizedField(cert.certification, "title", locale)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {format(cert.issuedAt, "PP", { locale: dateLocale })}
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                      <Link href={`/verify/${cert.uniqueCode}`}>{t("viewCertificate")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-muted-foreground">{t("noCertificates")}</p>
          )}
        </section>
      </div>
    </div>
  );
}
