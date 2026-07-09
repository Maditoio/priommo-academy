"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { certificationSchema } from "@/lib/validation";
import { adminRedirect } from "@/lib/admin-redirect";
import { revalidatePath } from "next/cache";

export async function createCertification(formData: FormData, locale: string) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = certificationSchema.safeParse({
    ...raw,
    courseId: raw.courseId || null,
  });
  if (!parsed.success) {
    adminRedirect(`/${locale}/admin/certifications`, "Invalid certification data", "error");
  }

  await db.certification.create({
    data: {
      ...parsed.data!,
      courseId: parsed.data!.courseId || null,
    },
  });

  revalidatePath(`/${locale}/admin/certifications`);
  adminRedirect(`/${locale}/admin/certifications`, "Certification created successfully");
}

export async function updateCertification(id: string, formData: FormData, locale: string) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = certificationSchema.safeParse({
    ...raw,
    courseId: raw.courseId || null,
  });
  if (!parsed.success) {
    adminRedirect(`/${locale}/admin/certifications`, "Invalid certification data", "error");
  }

  await db.certification.update({
    where: { id },
    data: {
      ...parsed.data!,
      courseId: parsed.data!.courseId || null,
    },
  });

  revalidatePath(`/${locale}/admin/certifications`);
  adminRedirect(`/${locale}/admin/certifications`, "Certification updated successfully");
}

export async function deleteCertification(id: string, locale: string) {
  await requireAdmin();
  const issued = await db.certificateIssued.count({ where: { certificationId: id } });
  if (issued > 0) {
    adminRedirect(`/${locale}/admin/certifications`, "Cannot delete — certificates already issued", "error");
  }
  await db.certification.delete({ where: { id } });
  revalidatePath(`/${locale}/admin/certifications`);
  adminRedirect(`/${locale}/admin/certifications`, "Certification deleted");
}
