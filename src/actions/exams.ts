"use server";

import { requireAdmin, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRedirect } from "@/lib/admin-redirect";
import { startExamAttempt, gradeAndFinishAttempt } from "@/lib/exams";
import {
  examSchema,
  examCategorySchema,
  examQuestionSchema,
  examCategoryReqSchema,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uniqueCategorySlug } from "@/lib/slug";
import type { ExamAttemptMode } from "@prisma/client";

export async function addExam(courseId: string, formData: FormData, locale: string) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = examSchema.safeParse({
    ...raw,
    isPractice: raw.isPractice === "on" || raw.isPractice === "true",
    questionCount: raw.questionCount ? Number(raw.questionCount) : null,
  });
  if (!parsed.success) {
    adminRedirect(`/${locale}/admin/courses/${courseId}`, "Invalid exam data", "error");
  }

  const exam = await db.exam.create({
    data: {
      courseId,
      titleFr: parsed.data!.titleFr,
      titleEn: parsed.data!.titleEn,
      passingScore: parsed.data!.passingScore,
      durationMin: parsed.data!.durationMin,
      maxAttempts: parsed.data!.maxAttempts,
      isPractice: parsed.data!.isPractice,
      questionCount: parsed.data!.questionCount,
    },
  });

  revalidatePath(`/${locale}/admin/courses/${courseId}`);
  adminRedirect(`/${locale}/admin/courses/${courseId}?exam=${exam.id}`, "Exam created");
}

export async function updateExam(examId: string, courseId: string, formData: FormData, locale: string) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = examSchema.safeParse({
    ...raw,
    isPractice: raw.isPractice === "on" || raw.isPractice === "true",
    questionCount: raw.questionCount ? Number(raw.questionCount) : null,
  });
  if (!parsed.success) {
    adminRedirect(`/${locale}/admin/courses/${courseId}?exam=${examId}`, "Invalid exam data", "error");
  }

  await db.exam.update({
    where: { id: examId },
    data: {
      titleFr: parsed.data!.titleFr,
      titleEn: parsed.data!.titleEn,
      passingScore: parsed.data!.passingScore,
      durationMin: parsed.data!.durationMin,
      maxAttempts: parsed.data!.maxAttempts,
      isPractice: parsed.data!.isPractice,
      questionCount: parsed.data!.questionCount,
    },
  });

  revalidatePath(`/${locale}/admin/courses/${courseId}`);
  adminRedirect(`/${locale}/admin/courses/${courseId}?exam=${examId}`, "Exam updated");
}

export async function addExamCategory(courseId: string, formData: FormData, locale: string) {
  await requireAdmin();
  const parsed = examCategorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;
  const data = parsed.data;

  const slug = await uniqueCategorySlug(courseId, data.nameFr);

  await db.examCategory.create({
    data: { ...data, slug, courseId },
  });
  revalidatePath(`/${locale}/admin/courses/${courseId}`);
  adminRedirect(`/${locale}/admin/courses/${courseId}`, "Category added");
}

export async function setExamCategoryRequirement(
  examId: string,
  courseId: string,
  formData: FormData,
  locale: string
) {
  await requireAdmin();
  const parsed = examCategoryReqSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;
  const data = parsed.data;

  await db.examCategoryRequirement.upsert({
    where: {
      examId_categoryId: { examId, categoryId: data.categoryId },
    },
    create: { examId, categoryId: data.categoryId, minScore: data.minScore },
    update: { minScore: data.minScore },
  });

  revalidatePath(`/${locale}/admin/courses/${courseId}`);
  adminRedirect(`/${locale}/admin/courses/${courseId}?exam=${examId}`, "Category requirement saved");
}

export async function addExamQuestion(examId: string, courseId: string, formData: FormData, locale: string) {
  await requireAdmin();

  const choiceLabelsFr = formData.getAll("choiceFr") as string[];
  const choiceLabelsEn = formData.getAll("choiceEn") as string[];
  const correctIndex = Number(formData.get("correctIndex") ?? 0);

  const parsed = examQuestionSchema.safeParse({
    levelId: formData.get("levelId"),
    categoryId: formData.get("categoryId"),
    promptFr: formData.get("promptFr"),
    promptEn: formData.get("promptEn"),
    order: formData.get("order") ?? 0,
  });

  if (!parsed.success || choiceLabelsFr.length < 2) {
    adminRedirect(`/${locale}/admin/courses/${courseId}?exam=${examId}`, "Invalid question", "error");
  }

  const data = parsed.data!;

  await db.examQuestion.create({
    data: {
      examId,
      levelId: data.levelId,
      categoryId: data.categoryId,
      promptFr: data.promptFr,
      promptEn: data.promptEn,
      order: data.order,
      choices: {
        create: choiceLabelsFr.map((labelFr, i) => ({
          labelFr,
          labelEn: choiceLabelsEn[i] ?? labelFr,
          isCorrect: i === correctIndex,
          order: i,
        })),
      },
    },
  });

  revalidatePath(`/${locale}/admin/courses/${courseId}`);
  adminRedirect(`/${locale}/admin/courses/${courseId}?exam=${examId}`, "Question added");
}

export async function startExam(
  examId: string,
  mode: ExamAttemptMode,
  locale: string,
  enrollmentId: string
) {
  const session = await requireAuth();
  const attempt = await startExamAttempt({
    userId: session.user.id,
    examId,
    mode,
    enrollmentId,
  });
  redirect(`/${locale}/dashboard/exams/${attempt.id}`);
}

export async function submitExamAnswers(
  attemptId: string,
  locale: string,
  formData: FormData,
  timedOut = false
) {
  const session = await requireAuth();
  const answers: Record<string, string | null> = {};

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("q_")) {
      answers[key.slice(2)] = String(value);
    }
  }

  const result = await gradeAndFinishAttempt({
    attemptId,
    userId: session.user.id,
    answers,
    timedOut,
  });

  const exam = await db.exam.findUnique({
    where: { id: result.attempt.examId },
    select: { courseId: true },
  });

  revalidatePath(`/${locale}/dashboard`);
  if (exam) {
    const enrollment = await db.enrollment.findFirst({
      where: { userId: session.user.id, courseId: exam.courseId },
    });
    if (enrollment) {
      revalidatePath(`/${locale}/dashboard/enrollments/${enrollment.id}`);
    }
  }

  redirect(`/${locale}/dashboard/exams/${attemptId}/results`);
}
