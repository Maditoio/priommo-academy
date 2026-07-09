import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { startExam } from "@/actions/exams";
import { updateEnrollmentProgress } from "@/actions/enrollment";
import { countOfficialAttempts } from "@/lib/exams";
import { localizedField } from "@/lib/utils";
import { levelName } from "@/lib/levels";
import { generateCertificateQR } from "@/lib/qr";
import { CertificateDisplay } from "@/components/public/certificate-display";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

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
  const te = await getTranslations("exam");
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
          exams: {
            include: {
              categoryReqs: { include: { category: true } },
              _count: { select: { questions: { where: { active: true } } } },
            },
          },
          certifications: {
            orderBy: { rank: "asc" },
            include: { level: true },
          },
        },
      },
    },
  });

  if (!enrollment) notFound();

  const certification = enrollment.course.certifications[0];
  const [certificate, user] = await Promise.all([
    certification
      ? db.certificateIssued.findFirst({
          where: {
            userId: session.user.id,
            certificationId: certification.id,
          },
        })
      : Promise.resolve(null),
    db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true, imageUrl: true },
    }),
  ]);

  const qrDataUrl = certificate ? await generateCertificateQR(certificate.uniqueCode) : null;
  const officialExams = enrollment.course.exams.filter((e) => !e.isPractice);
  const practiceExams = enrollment.course.exams.filter((e) => e.isPractice);

  const attemptCounts = await Promise.all(
    officialExams.map(async (exam) => ({
      examId: exam.id,
      used: await countOfficialAttempts(session.user.id, exam.id),
    }))
  );

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
                        <MaterialIcon name="menu_book" className="text-ink-muted" size={16} />
                        {localizedField(lesson, "title", locale)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            {enrollment.status !== "COMPLETED" && officialExams.length > 0 && (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                  <MaterialIcon name="school" className="text-accent" size={22} />
                  {te("officialExams")}
                </h3>
                {officialExams.map((exam) => {
                  const used =
                    attemptCounts.find((a) => a.examId === exam.id)?.used ?? 0;
                  const remaining = Math.max(0, exam.maxAttempts - used);
                  const canStart = remaining > 0 && exam._count.questions > 0;

                  return (
                    <Card key={exam.id} className="shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium text-ink">
                              {localizedField(exam, "title", locale)}
                            </p>
                            <p className="mt-1 text-sm text-ink-muted">
                              {te("passingScore")}: {exam.passingScore}% · {te("duration")}:{" "}
                              {exam.durationMin} min
                            </p>
                            <p className="text-sm text-ink-muted">
                              {te("attemptsRemaining")}: {remaining}/{exam.maxAttempts}
                            </p>
                          </div>
                          {canStart ? (
                            <form action={startExam.bind(null, exam.id, "OFFICIAL", locale, enrollment.id)}>
                              <Button type="submit">
                                <MaterialIcon name="play_arrow" size={18} />
                                {t("takeExam")}
                              </Button>
                            </form>
                          ) : (
                            <p className="text-sm text-ink-muted">{te("noAttemptsLeft")}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>
            )}

            {practiceExams.length > 0 && (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                  <MaterialIcon name="fitness_center" className="text-accent" size={22} />
                  {te("practiceExams")}
                </h3>
                {practiceExams.map((exam) => (
                  <Card key={exam.id} className="border-dashed shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-ink">
                            {localizedField(exam, "title", locale)}
                          </p>
                          <p className="mt-1 text-sm text-ink-muted">{te("practiceDescription")}</p>
                        </div>
                        {exam._count.questions >= 10 ? (
                          <form
                            action={startExam.bind(null, exam.id, "PRACTICE", locale, enrollment.id)}
                          >
                            <Button type="submit" variant="secondary">
                              <MaterialIcon name="quiz" size={18} />
                              {te("startPractice")}
                            </Button>
                          </form>
                        ) : (
                          <p className="text-sm text-ink-muted">{te("notEnoughQuestions")}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}
          </div>

          <div className="space-y-4">
            {certificate && qrDataUrl && certification && (
              <CertificateDisplay
                uniqueCode={certificate.uniqueCode}
                status={certificate.status}
                level={levelName(certification.level, locale)}
                title={localizedField(certification, "title", locale)}
                holderName={user.name}
                holderImageUrl={user.imageUrl}
                issuedAt={certificate.issuedAt.toISOString()}
                expiresAt={certificate.expiresAt?.toISOString() ?? null}
                qrDataUrl={qrDataUrl}
                locale={locale}
                statusLabel={ts(certificate.status)}
                compact
                labels={{
                  holder: tv("holder"),
                  issuedAt: tv("issuedAt"),
                  expiresAt: tv("expiresAt"),
                  verify: t("viewCertificate"),
                  copyLink: tv("copyLink"),
                  copied: tv("copied"),
                }}
              />
            )}

            <form
              action={updateEnrollmentProgress.bind(null, enrollment.id, enrollment.progressPct + 25, locale)}
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
