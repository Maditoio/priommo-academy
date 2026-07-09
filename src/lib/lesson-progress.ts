import { db } from "@/lib/db";

export async function getEnrollmentLessonStats(enrollmentId: string, courseId: string) {
  const [totalLessons, completedLessons] = await Promise.all([
    db.lesson.count({
      where: { module: { courseId } },
    }),
    db.lessonCompletion.count({
      where: { enrollmentId },
    }),
  ]);

  const progressPct =
    totalLessons === 0 ? 100 : Math.round((completedLessons / totalLessons) * 100);

  return { totalLessons, completedLessons, progressPct, curriculumComplete: completedLessons >= totalLessons && totalLessons > 0 };
}

export async function getCompletedLessonIds(enrollmentId: string) {
  const rows = await db.lessonCompletion.findMany({
    where: { enrollmentId },
    select: { lessonId: true },
  });
  return new Set(rows.map((r) => r.lessonId));
}

export async function syncEnrollmentProgress(enrollmentId: string) {
  const enrollment = await db.enrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    select: { courseId: true, status: true },
  });

  const { progressPct, curriculumComplete } = await getEnrollmentLessonStats(
    enrollmentId,
    enrollment.courseId
  );

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPct,
      ...(enrollment.status !== "COMPLETED" && curriculumComplete
        ? { status: "ACTIVE" }
        : {}),
    },
  });

  return { progressPct, curriculumComplete };
}

export async function assertCurriculumComplete(userId: string, courseId: string) {
  const enrollment = await db.enrollment.findFirst({
    where: { userId, courseId },
  });
  if (!enrollment) throw new Error("Not enrolled");

  const { curriculumComplete, totalLessons } = await getEnrollmentLessonStats(
    enrollment.id,
    courseId
  );

  if (totalLessons > 0 && !curriculumComplete) {
    throw new Error("Curriculum incomplete");
  }

  return enrollment;
}
