import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ExamTaker } from "@/components/learner/exam-taker";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

export default async function ExamAttemptPage({
  params,
}: {
  params: Promise<{ locale: string; attemptId: string }>;
}) {
  const { locale, attemptId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("exam");

  const attempt = await db.examAttempt.findFirst({
    where: { id: attemptId, userId: session.user.id, finishedAt: null },
    include: {
      answers: {
        include: {
          question: {
            include: {
              choices: { orderBy: { order: "asc" } },
              category: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) notFound();

  if (new Date() > attempt.endsAt) {
    redirect(`/${locale}/dashboard/exams/${attemptId}/results`);
  }

  const questions = attempt.answers
    .map((a) => a.question)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="px-6 py-12">
      <ExamTaker
        attemptId={attempt.id}
        locale={locale}
        endsAt={attempt.endsAt.toISOString()}
        questions={questions}
        labels={{
          submit: t("submit"),
          timeRemaining: t("timeRemaining"),
          question: t("question"),
          of: t("of"),
        }}
      />
    </div>
  );
}
