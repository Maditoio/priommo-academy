import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { submitExam, updateEnrollmentProgress } from "@/actions/enrollment";
import { localizedField } from "@/lib/utils";
import { generateCertificateQR } from "@/lib/qr";
import { CertificateDisplay } from "@/components/public/certificate-display";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

export default async function EnrollmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("dashboard");
  const ts = await getTranslations("status");
  const tc = await getTranslations("courses");
  const tv = await getTranslations("verify");

  const enrollment = await db.enrollment.findFirst({
    where: { id, userId: session.user.id },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
          exams: true,
          certifications: { orderBy: { rank: "asc" } },
        },
      },
    },
  });

  if (!enrollment) notFound();

  const certification = enrollment.course.certifications[0];
  const certificate = certification
    ? await db.certificateIssued.findFirst({
        where: {
          userId: session.user.id,
          certificationId: certification.id,
        },
      })
    : null;

  const qrDataUrl = certificate ? await generateCertificateQR(certificate.uniqueCode) : null;
  const exam = enrollment.course.exams[0];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            ← {t("title")}
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              {localizedField(enrollment.course, "title", locale)}
            </h1>
            <div className="mt-2">
              <StatusBadge status={enrollment.status} label={ts(enrollment.status)} />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <div className="mb-1 flex justify-between text-sm">
              <span>{t("progress")}</span>
              <span>{enrollment.progressPct}%</span>
            </div>
            <Progress value={enrollment.progressPct} />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-lg font-semibold text-ink">{tc("curriculum")}</h2>
            {enrollment.course.modules.map((mod) => (
              <Card key={mod.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{localizedField(mod, "title", locale)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-ink-muted" />
                        {localizedField(lesson, "title", locale)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            {exam && enrollment.status !== "COMPLETED" && (
              <Card className="border-accent/20 bg-accent-soft/50 shadow-sm">
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="font-medium text-ink">{localizedField(exam, "title", locale)}</p>
                    <p className="text-sm text-ink-muted">Score minimum: {exam.passingScore}%</p>
                  </div>
                  <form action={submitExam.bind(null, exam.id, enrollment.id, locale)}>
                    <Button type="submit">{t("takeExam")}</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {certificate && qrDataUrl && (
              <CertificateDisplay
                uniqueCode={certificate.uniqueCode}
                status={certificate.status}
                level={certification!.level}
                title={localizedField(certification!, "title", locale)}
                issuedAt={certificate.issuedAt.toISOString()}
                expiresAt={certificate.expiresAt?.toISOString() ?? null}
                qrDataUrl={qrDataUrl}
                locale={locale}
                statusLabel={ts(certificate.status)}
                compact
                labels={{
                  issuedAt: tv("issuedAt"),
                  expiresAt: tv("expiresAt"),
                  verify: t("viewCertificate"),
                  copyLink: tv("copyLink"),
                  copied: tv("copied"),
                }}
              />
            )}

            <form action={updateEnrollmentProgress.bind(null, enrollment.id, enrollment.progressPct + 25, locale)}>
              <Button type="submit" variant="secondary" className="w-full">
                +25% {t("progress")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
