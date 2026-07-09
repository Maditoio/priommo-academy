import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { startExam } from "@/actions/exams";
import { countOfficialAttempts } from "@/lib/exams";
import { getCompletedLessonIds, getEnrollmentLessonStats } from "@/lib/lesson-progress";
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
  const [certificate, user, completedIds, lessonStats, attemptCounts] = await Promise.all([
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
    getCompletedLessonIds(enrollment.id),
    getEnrollmentLessonStats(enrollment.id, enrollment.courseId),
    Promise.all(
      enrollment.course.exams
        .filter((e) => !e.isPractice)
        .map(async (exam) => ({
          examId: exam.id,
          used: await countOfficialAttempts(session.user.id, exam.id),
        }))
    ),
  ]);

  const flatLessons = enrollment.course.modules.flatMap((m) => m.lessons);
  const firstIncomplete =
    flatLessons.find((l) => !completedIds.has(l.id)) ?? flatLessons[0];

  const qrDataUrl = certificate ? await generateCertificateQR(certificate.uniqueCode) : null;
  const officialExams = enrollment.course.exams.filter((e) => !e.isPractice);
  const practiceExams = enrollment.course.exams.filter((e) => e.isPractice);
  const curriculumComplete = lessonStats.curriculumComplete;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 space-y-3">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
            <MaterialIcon name="arrow_back" size={16} />
            {t("overview")}
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              {localizedField(enrollment.course, "title", locale)}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={enrollment.status} label={ts(enrollment.status)} />
              <span className="text-sm text-ink-muted">
                {lessonStats.completedLessons}/{lessonStats.totalLessons} {tc("lessons")}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">{t("progress")}</span>
            <span className="font-medium">{lessonStats.progressPct}%</span>
          </div>
          <Progress value={lessonStats.progressPct} />
          {firstIncomplete && (
            <Button asChild className="w-full">
              <Link href={`/dashboard/enrollments/${enrollment.id}/lessons/${firstIncomplete.id}`}>
                <MaterialIcon name="play_arrow" size={18} />
                {curriculumComplete ? t("reviewCourse") : t("continueLearning")}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-ink">{tc("curriculum")}</h2>
            <div className="mt-4 space-y-4">
              {enrollment.course.modules.map((mod) => (
                <Card key={mod.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{localizedField(mod, "title", locale)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {mod.lessons.map((lesson) => {
                      const done = completedIds.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/dashboard/enrollments/${enrollment.id}/lessons/${lesson.id}`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-hover"
                        >
                          <MaterialIcon
                            name={done ? "check_circle" : "play_circle"}
                            size={20}
                            className={done ? "text-success" : "text-accent"}
                          />
                          <span className="flex-1 text-ink">{localizedField(lesson, "title", locale)}</span>
                          {lesson.durationMin && (
                            <span className="text-xs text-ink-muted">{lesson.durationMin} min</span>
                          )}
                        </Link>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {enrollment.status !== "COMPLETED" && officialExams.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                  <MaterialIcon name="school" className="text-accent" size={22} />
                  {te("officialExams")}
                </h2>
              </div>
              {!curriculumComplete && (
                <Card className="border-warning/30 bg-warning/5 shadow-sm">
                  <CardContent className="flex items-start gap-3 pt-5 text-sm text-ink-muted">
                    <MaterialIcon name="info" className="mt-0.5 shrink-0 text-warning" size={20} />
                    {t("completeCurriculumFirst")}
                  </CardContent>
                </Card>
              )}
              {officialExams.map((exam) => {
                const used = attemptCounts.find((a) => a.examId === exam.id)?.used ?? 0;
                const remaining = Math.max(0, exam.maxAttempts - used);
                const canStart = remaining > 0 && exam._count.questions > 0 && curriculumComplete;

                return (
                  <Card key={exam.id} className="shadow-sm">
                    <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-ink">{localizedField(exam, "title", locale)}</p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {te("passingScore")}: {exam.passingScore}% · {te("duration")}: {exam.durationMin} min
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
                        <p className="text-sm text-ink-muted">
                          {!curriculumComplete
                            ? t("completeCurriculumFirst")
                            : te("noAttemptsLeft")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          )}

          {practiceExams.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                <MaterialIcon name="fitness_center" className="text-accent" size={22} />
                {te("practiceExams")}
              </h2>
              {practiceExams.map((exam) => (
                <Card key={exam.id} className="border-dashed shadow-sm">
                  <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-ink">{localizedField(exam, "title", locale)}</p>
                      <p className="mt-1 text-sm text-ink-muted">{te("practiceDescription")}</p>
                    </div>
                    {exam._count.questions >= 10 ? (
                      <form action={startExam.bind(null, exam.id, "PRACTICE", locale, enrollment.id)}>
                        <Button type="submit" variant="secondary">
                          <MaterialIcon name="quiz" size={18} />
                          {te("startPractice")}
                        </Button>
                      </form>
                    ) : (
                      <p className="text-sm text-ink-muted">{te("notEnoughQuestions")}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </section>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
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
              verifyHref={`/dashboard/verify/${certificate.uniqueCode}`}
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
        </aside>
      </div>
    </div>
  );
}
