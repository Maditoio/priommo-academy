"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRedirect } from "@/lib/admin-redirect";
import { levelSchema } from "@/lib/validation";
import { uniqueLevelSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export async function createLevel(formData: FormData, locale: string) {
  await requireAdmin();
  const parsed = levelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    adminRedirect(`/${locale}/admin/levels`, "Invalid level data", "error");
  }

  const slug = await uniqueLevelSlug(parsed.data!.nameFr);
  await db.certificationLevel.create({ data: { ...parsed.data!, slug } });
  revalidatePath(`/${locale}/admin/levels`);
  adminRedirect(`/${locale}/admin/levels`, "Level created");
}

export async function updateLevel(id: string, formData: FormData, locale: string) {
  await requireAdmin();
  const parsed = levelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    adminRedirect(`/${locale}/admin/levels`, "Invalid level data", "error");
  }

  const slug = await uniqueLevelSlug(parsed.data!.nameFr, id);
  await db.certificationLevel.update({ where: { id }, data: { ...parsed.data!, slug } });
  revalidatePath(`/${locale}/admin/levels`);
  adminRedirect(`/${locale}/admin/levels`, "Level updated");
}

export async function deleteLevel(id: string, locale: string) {
  await requireAdmin();
  const inUse =
    (await db.course.count({ where: { levelId: id } })) +
    (await db.certification.count({ where: { levelId: id } }));
  if (inUse > 0) {
    adminRedirect(`/${locale}/admin/levels`, "Level is in use", "error");
  }
  await db.certificationLevel.delete({ where: { id } });
  revalidatePath(`/${locale}/admin/levels`);
  adminRedirect(`/${locale}/admin/levels`, "Level deleted");
}
