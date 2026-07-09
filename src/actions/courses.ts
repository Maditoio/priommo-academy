"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { courseSchema, moduleSchema, lessonSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourse(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = courseSchema.safeParse({
    ...raw,
    published: raw.published === "on" || raw.published === "true",
    price: raw.price,
  });
  if (!parsed.success) return;

  const course = await db.course.create({
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(id: string, formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = courseSchema.safeParse({
    ...raw,
    published: raw.published === "on" || raw.published === "true",
    price: raw.price,
  });
  if (!parsed.success) return;

  await db.course.update({
    where: { id },
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
}

export async function toggleCoursePublish(id: string, published: boolean) {
  await requireAdmin();
  const enrollments = await db.enrollment.count({ where: { courseId: id } });
  if (!published && enrollments > 0) {
    await db.course.update({ where: { id }, data: { published: false } });
  } else {
    await db.course.update({ where: { id }, data: { published } });
  }
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function addModule(courseId: string, formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = moduleSchema.safeParse(raw);
  if (!parsed.success) return;

  await db.module.create({ data: { ...parsed.data, courseId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function addLesson(moduleId: string, courseId: string, formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = lessonSchema.safeParse(raw);
  if (!parsed.success) return;

  await db.lesson.create({
    data: {
      ...parsed.data,
      moduleId,
      contentUrl: parsed.data.contentUrl || null,
      bodyFr: parsed.data.bodyFr || null,
      bodyEn: parsed.data.bodyEn || null,
      durationMin: parsed.data.durationMin ?? null,
    },
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function addExam(courseId: string, formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const titleFr = String(raw.titleFr ?? "");
  const titleEn = String(raw.titleEn ?? "");
  const passingScore = Number(raw.passingScore ?? 70);

  await db.exam.create({
    data: { courseId, titleFr, titleEn, passingScore },
  });
  revalidatePath(`/admin/courses/${courseId}`);
}
