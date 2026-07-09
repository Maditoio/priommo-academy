import { db } from "@/lib/db";
import { issueCertificateAfterPass } from "@/lib/certificates";
import type { ExamAttemptMode } from "@prisma/client";

const PRACTICE_QUESTION_COUNT = 10;

export type CategoryScore = {
  categoryId: string;
  nameFr: string;
  nameEn: string;
  correct: number;
  total: number;
  pct: number;
  minScore: number;
  passed: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Draw N questions with balanced representation across categories when possible. */
function drawQuestions<T extends { categoryId: string }>(
  pool: T[],
  drawCount: number
): T[] {
  if (drawCount >= pool.length) return shuffle(pool);

  const byCategory = new Map<string, T[]>();
  for (const q of pool) {
    const list = byCategory.get(q.categoryId) ?? [];
    list.push(q);
    byCategory.set(q.categoryId, list);
  }

  const categories = shuffle([...byCategory.keys()]);
  const base = Math.floor(drawCount / categories.length);
  let extra = drawCount % categories.length;
  const selected: T[] = [];

  for (const categoryId of categories) {
    const bucket = byCategory.get(categoryId)!;
    const take = Math.min(bucket.length, base + (extra > 0 ? 1 : 0));
    if (extra > 0) extra -= 1;
    selected.push(...shuffle(bucket).slice(0, take));
  }

  if (selected.length < drawCount) {
    const picked = new Set(selected);
    const remaining = shuffle(pool.filter((q) => !picked.has(q)));
    selected.push(...remaining.slice(0, drawCount - selected.length));
  }

  return shuffle(selected).slice(0, drawCount);
}

export async function countOfficialAttempts(userId: string, examId: string) {
  return db.examAttempt.count({
    where: {
      userId,
      examId,
      mode: "OFFICIAL",
      finishedAt: { not: null },
    },
  });
}

export async function startExamAttempt(params: {
  userId: string;
  examId: string;
  mode: ExamAttemptMode;
  enrollmentId?: string;
}) {
  const exam = await db.exam.findUniqueOrThrow({
    where: { id: params.examId },
    include: {
      course: true,
      questions: {
        where: { active: true },
        include: { choices: true },
      },
    },
  });

  if (exam.isPractice && params.mode !== "PRACTICE") {
    throw new Error("Invalid exam mode");
  }
  if (!exam.isPractice && params.mode !== "OFFICIAL") {
    throw new Error("Invalid exam mode");
  }

  const enrollment = await db.enrollment.findFirst({
    where: { userId: params.userId, courseId: exam.courseId },
  });
  if (!enrollment) throw new Error("Not enrolled");

  if (params.mode === "OFFICIAL") {
    const used = await countOfficialAttempts(params.userId, exam.id);
    if (used >= exam.maxAttempts) {
      throw new Error("No attempts remaining");
    }

    const totalLessons = await db.lesson.count({
      where: { module: { courseId: exam.courseId } },
    });
    if (totalLessons > 0) {
      const completedLessons = await db.lessonCompletion.count({
        where: { enrollmentId: enrollment.id },
      });
      if (completedLessons < totalLessons) {
        throw new Error("Curriculum incomplete");
      }
    }
  }

  const pool = exam.questions.filter((q) => q.choices.some((c) => c.isCorrect));
  if (pool.length === 0) throw new Error("No questions available");

  const drawCount =
    params.mode === "PRACTICE"
      ? Math.min(PRACTICE_QUESTION_COUNT, pool.length)
      : exam.questionCount
        ? Math.min(exam.questionCount, pool.length)
        : pool.length;

  const selected = drawQuestions(pool, drawCount);
  const now = new Date();
  const endsAt = new Date(now.getTime() + exam.durationMin * 60 * 1000);

  const attempt = await db.examAttempt.create({
    data: {
      examId: exam.id,
      userId: params.userId,
      mode: params.mode,
      startedAt: now,
      endsAt,
      questionIds: selected.map((q) => q.id),
      answers: {
        create: selected.map((q) => ({
          questionId: q.id,
          isCorrect: false,
        })),
      },
    },
    include: {
      exam: {
        include: {
          categoryReqs: { include: { category: true } },
        },
      },
      answers: {
        include: {
          question: {
            include: { choices: true, category: true, level: true },
          },
        },
      },
    },
  });

  return attempt;
}

export async function gradeAndFinishAttempt(params: {
  attemptId: string;
  userId: string;
  answers: Record<string, string | null>;
  timedOut?: boolean;
}) {
  const attempt = await db.examAttempt.findFirst({
    where: { id: params.attemptId, userId: params.userId, finishedAt: null },
    include: {
      exam: {
        include: {
          categoryReqs: { include: { category: true } },
          course: { include: { certifications: { orderBy: { rank: "asc" } } } },
        },
      },
      answers: {
        include: {
          question: { include: { category: true, choices: true } },
        },
      },
    },
  });

  if (!attempt) throw new Error("Attempt not found or already finished");

  const now = new Date();
  const timedOut = params.timedOut ?? now > attempt.endsAt;

  const categoryMap = new Map<string, CategoryScore>();

  for (const answer of attempt.answers) {
    const cat = answer.question.category;
    if (!categoryMap.has(cat.id)) {
      const req = attempt.exam.categoryReqs.find((r) => r.categoryId === cat.id);
      categoryMap.set(cat.id, {
        categoryId: cat.id,
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
        correct: 0,
        total: 0,
        pct: 0,
        minScore: req?.minScore ?? 0,
        passed: true,
      });
    }
    const entry = categoryMap.get(cat.id)!;
    entry.total += 1;

    const choiceId = params.answers[answer.questionId] ?? null;
    const correctChoice = answer.question.choices.find((c) => c.isCorrect);
    const isCorrect = !!(choiceId && correctChoice && choiceId === correctChoice.id);

    if (isCorrect) entry.correct += 1;

    await db.examAttemptAnswer.update({
      where: { id: answer.id },
      data: { choiceId, isCorrect },
    });
  }

  let totalCorrect = 0;
  let totalQuestions = 0;
  const categoryScores: CategoryScore[] = [];

  for (const entry of categoryMap.values()) {
    entry.pct = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
    entry.passed = entry.minScore === 0 || entry.pct >= entry.minScore;
    categoryScores.push(entry);
    totalCorrect += entry.correct;
    totalQuestions += entry.total;
  }

  const overallScore =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const overallPassed = overallScore >= attempt.exam.passingScore;
  const categoriesPassed = categoryScores.every((c) => c.passed);
  const passed = overallPassed && categoriesPassed;

  const updated = await db.examAttempt.update({
    where: { id: attempt.id },
    data: {
      score: overallScore,
      passed,
      finishedAt: now,
      timedOut,
      categoryScores: categoryScores as object,
    },
  });

  let certificate = null;
  if (attempt.mode === "OFFICIAL" && passed) {
    const result = await issueCertificateAfterPass({
      userId: params.userId,
      examId: attempt.examId,
      courseId: attempt.exam.courseId,
    });
    certificate = result.certificate;
  }

  return { attempt: updated, categoryScores, certificate, overallScore, passed };
}
