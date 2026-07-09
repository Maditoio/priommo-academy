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
import Image from "next/image";

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
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-accent-soft">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.name}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <MaterialIcon name="person" className="text-accent" size={28} />
            )}
          </div>
          <div>
            <h1 className="text-[1.875rem] font-semibold text-ink">{t("title")}</h1>
            <p className="text-ink-muted">{user.name}</p>
          </div>
          <Button asChild variant="secondary" size="sm" className="ml-auto">
            <Link href="/profile">
              <MaterialIcon name="manage_accounts" size={18} />
              {locale === "fr" ? "Profil" : "Profile"}
            </Link>
          </Button>
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
