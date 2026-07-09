"use server";

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncEnrollmentProgress } from "@/lib/lesson-progress";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function markLessonComplete(lessonId: string, enrollmentId: string, locale: string) {
  const session = await requireAuth();

  const enrollment = await db.enrollment.findFirst({
    where: { id: enrollmentId, userId: session.user.id },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (!enrollment) throw new Error("Enrollment not found");

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, module: { courseId: enrollment.courseId } },
  });
  if (!lesson) throw new Error("Lesson not found");

  await db.lessonCompletion.upsert({
    where: {
      userId_lessonId_enrollmentId: {
        userId: session.user.id,
        lessonId,
        enrollmentId,
      },
    },
    create: {
      userId: session.user.id,
      lessonId,
      enrollmentId,
    },
    update: {},
  });

  await syncEnrollmentProgress(enrollmentId);

  const flatLessons = enrollment.course.modules.flatMap((m) => m.lessons);
  const currentIndex = flatLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = flatLessons[currentIndex + 1];

  revalidatePath(`/${locale}/dashboard/enrollments/${enrollmentId}`);
  revalidatePath(`/${locale}/dashboard`);

  if (nextLesson) {
    redirect(`/${locale}/dashboard/enrollments/${enrollmentId}/lessons/${nextLesson.id}`);
  }

  redirect(`/${locale}/dashboard/enrollments/${enrollmentId}?toast=success&msg=${encodeURIComponent("Lesson completed")}`);
}
