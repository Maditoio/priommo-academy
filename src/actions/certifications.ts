"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { certificationSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCertification(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = certificationSchema.safeParse({
    ...raw,
    courseId: raw.courseId || null,
  });
  if (!parsed.success) return;

  const cert = await db.certification.create({
    data: {
      ...parsed.data,
      courseId: parsed.data.courseId || null,
    },
  });

  revalidatePath("/admin/certifications");
  redirect(`/admin/certifications/${cert.id}`);
}

export async function updateCertification(id: string, formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = certificationSchema.safeParse({
    ...raw,
    courseId: raw.courseId || null,
  });
  if (!parsed.success) return;

  await db.certification.update({
    where: { id },
    data: {
      ...parsed.data,
      courseId: parsed.data.courseId || null,
    },
  });

  revalidatePath("/admin/certifications");
  revalidatePath(`/admin/certifications/${id}`);
}
