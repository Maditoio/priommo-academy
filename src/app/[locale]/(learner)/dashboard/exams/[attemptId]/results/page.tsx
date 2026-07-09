import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { CategoryScore } from "@/lib/exams";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusBadge } from "@/components/public/status-badge";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { localizedField } from "@/lib/utils";

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ locale: string; attemptId: string }>;
}) {
  const { locale, attemptId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("exam");
  const ts = await getTranslations("status");

  const attempt = await db.examAttempt.findFirst({
    where: { id: attemptId, userId: session.user.id },
    include: {
      exam: true,
    },
  });

  if (!attempt || !attempt.finishedAt) notFound();

  const categoryScores = (attempt.categoryScores as CategoryScore[] | null) ?? [];
  const isPractice = attempt.mode === "PRACTICE";

  const enrollment = await db.enrollment.findFirst({
    where: {
      userId: session.user.id,
      course: { exams: { some: { id: attempt.examId } } },
    },
  });

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              attempt.passed ? "bg-success/10" : "bg-danger/10"
            }`}
          >
            <MaterialIcon
              name={attempt.passed ? "emoji_events" : "cancel"}
              className={attempt.passed ? "text-success" : "text-danger"}
              size={32}
            />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-ink">
            {attempt.passed ? t("passed") : t("failed")}
          </h1>
          <p className="mt-2 text-ink-muted">
            {localizedField(attempt.exam, "title", locale)} — {attempt.score}%
          </p>
          {isPractice && (
            <p className="mt-1 text-sm text-ink-muted">{t("practiceNote")}</p>
          )}
          {attempt.timedOut && (
            <p className="mt-2 text-sm text-warning">{t("timedOut")}</p>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MaterialIcon name="category" size={18} className="text-accent" />
            {t("categoryBreakdown")}
          </h2>
          {categoryScores.map((cat) => (
            <div
              key={cat.categoryId}
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-sm"
            >
              <span className="text-sm text-ink">
                {locale === "fr" ? cat.nameFr : cat.nameEn}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{cat.pct}%</span>
                <StatusBadge
                  status={cat.passed ? "VALID" : "FAILED"}
                  label={cat.passed ? ts("VALID") : ts("FAILED")}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2">
          {enrollment && (
            <Button asChild variant="secondary">
              <Link href={`/dashboard/enrollments/${enrollment.id}`}>
                <MaterialIcon name="arrow_back" size={18} />
                {t("backToCourse")}
              </Link>
            </Button>
          )}
          {!isPractice && !attempt.passed && enrollment && (
            <Button asChild>
              <Link href={`/dashboard/enrollments/${enrollment.id}`}>
                <MaterialIcon name="replay" size={18} />
                {t("retry")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
