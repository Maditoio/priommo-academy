import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { submitExam } from "@/actions/enrollment";
import { updateEnrollmentProgress } from "@/actions/enrollment";
import { localizedField } from "@/lib/utils";
import { generateCertificateQR } from "@/lib/qr";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { BookOpen, CheckCircle } from "lucide-react";
import Image from "next/image";

export default async function EnrollmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ examResult?: string }>;
}) {
  const { locale, id } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("dashboard");
  const ts = await getTranslations("status");
  const tc = await getTranslations("courses");

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
          certifications: true,
        },
      },
    },
  });

  if (!enrollment) notFound();

  const certificate = enrollment.course.certifications[0]
    ? await db.certificateIssued.findFirst({
        where: {
          userId: session.user.id,
          certificationId: enrollment.course.certifications[0].id,
        },
      })
    : null;

  const qrDataUrl = certificate ? await generateCertificateQR(certificate.uniqueCode) : null;
  const exam = enrollment.course.exams[0];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            ← {t("title")}
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{localizedField(enrollment.course, "title", locale)}</h1>
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
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">{tc("curriculum")}</h2>
            {enrollment.course.modules.map((mod) => (
              <Card key={mod.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{localizedField(mod, "title", locale)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {localizedField(lesson, "title", locale)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            {exam && enrollment.status !== "COMPLETED" && (
              <Card className="border-primary/20 bg-accent/30">
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="font-medium">{localizedField(exam, "title", locale)}</p>
                    <p className="text-sm text-muted-foreground">
                      Score minimum: {exam.passingScore}%
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await submitExam(exam.id, enrollment.id, locale);
                    }}
                  >
                    <Button type="submit">{t("takeExam")}</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {certificate && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-emerald-800">
                    <CheckCircle className="h-5 w-5" />
                    {t("certificateIssued")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  {qrDataUrl && (
                    <Image src={qrDataUrl} alt="QR Code" width={200} height={200} className="mx-auto" />
                  )}
                  <Button asChild className="mt-4 w-full" variant="outline">
                    <Link href={`/verify/${certificate.uniqueCode}`}>{t("viewCertificate")}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <form
              action={async () => {
                "use server";
                await updateEnrollmentProgress(enrollment.id, enrollment.progressPct + 25);
              }}
            >
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
