"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { courseSchema, moduleSchema, lessonSchema } from "@/lib/validation";
import { adminRedirect } from "@/lib/admin-redirect";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData, locale: string) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = courseSchema.safeParse({
    ...raw,
    published: raw.published === "on" || raw.published === "true",
    price: raw.price,
  });
  if (!parsed.success) {
    adminRedirect(`/${locale}/admin/courses`, "Invalid course data", "error");
  }

  await db.course.create({
    data: {
      ...parsed.data!,
      imageUrl: parsed.data!.imageUrl || null,
    },
  });

  revalidatePath(`/${locale}/admin/courses`);
  adminRedirect(`/${locale}/admin/courses`, "Course created successfully");
}

export async function updateCourse(id: string, formData: FormData, locale: string) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = courseSchema.safeParse({
    ...raw,
    published: raw.published === "on" || raw.published === "true",
    price: raw.price,
  });
  if (!parsed.success) {
    adminRedirect(`/${locale}/admin/courses`, "Invalid course data", "error");
  }

  await db.course.update({
    where: { id },
    data: {
      ...parsed.data!,
      imageUrl: parsed.data!.imageUrl || null,
    },
  });

  revalidatePath(`/${locale}/admin/courses`);
  adminRedirect(`/${locale}/admin/courses`, "Course updated successfully");
}

export async function addModule(courseId: string, formData: FormData, locale: string) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = moduleSchema.safeParse(raw);
  if (!parsed.success) return;

  await db.module.create({ data: { ...parsed.data, courseId } });
  revalidatePath(`/${locale}/admin/courses`);
  revalidatePath(`/${locale}/admin/courses/${courseId}`);
  adminRedirect(`/${locale}/admin/courses/${courseId}`, "Module added");
}

export async function addLesson(moduleId: string, courseId: string, formData: FormData, locale: string) {
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
  revalidatePath(`/${locale}/admin/courses`);
  revalidatePath(`/${locale}/admin/courses/${courseId}`);
  adminRedirect(`/${locale}/admin/courses/${courseId}`, "Lesson added");
}
