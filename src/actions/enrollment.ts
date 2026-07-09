"use server";

import { auth, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { initiatePayment, enrollInFreeCourse, confirmPayment } from "@/lib/payments";
import { issueCertificateOnExamPass, revokeCertificate } from "@/lib/certificates";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function enrollInCourse(courseId: string, locale: string) {
  const session = await requireAuth();
  const course = await db.course.findUniqueOrThrow({ where: { id: courseId } });

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) {
    redirect(`/${locale}/dashboard/enrollments/${existing.id}`);
  }

  const price = parseFloat(course.price.toString());
  if (price === 0) {
    const enrollment = await enrollInFreeCourse(session.user.id, courseId);
    redirect(`/${locale}/dashboard/enrollments/${enrollment.id}`);
  }

  const payment = await initiatePayment({
    userId: session.user.id,
    amount: price,
    currency: course.currency,
    relatedType: "course",
    relatedId: courseId,
  });

  redirect(`/${locale}/payment/${payment.id}`);
}

export async function processMockPayment(paymentId: string, success: boolean, locale: string) {
  await requireAuth();
  await confirmPayment(paymentId, success);
  if (success) {
    redirect(`/${locale}/dashboard`);
  }
  redirect(`/${locale}/payment/${paymentId}?failed=1`);
}

export async function submitExam(examId: string, enrollmentId: string, locale: string) {
  const session = await requireAuth();
  const score = 85; // MVP: simulated passing score
  const result = await issueCertificateOnExamPass({
    userId: session.user.id,
    examId,
    score,
  });

  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/dashboard/enrollments/${enrollmentId}`);
  return result;
}

export async function revokeCertificateAction(id: string, reason: string) {
  await requireAdmin();
  await revokeCertificate(id, reason);
  revalidatePath("/admin/certificates");
  return { success: true };
}

export async function createOrganization(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "");
  const type = String(formData.get("type") ?? "");
  const contactEmail = String(formData.get("contactEmail") ?? "");
  const seats = Number(formData.get("seats") ?? 0);

  await db.organization.create({ data: { name, type, contactEmail, seats } });
  revalidatePath("/admin/organizations");
}

export async function updateEnrollmentProgress(enrollmentId: string, progressPct: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.enrollment.updateMany({
    where: { id: enrollmentId, userId: session.user.id },
    data: { progressPct: Math.min(100, Math.max(0, progressPct)) },
  });
  revalidatePath("/dashboard");
  return { success: true };
}
