"use server";

import { auth, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { initiatePayment, enrollInFreeCourse, confirmPayment } from "@/lib/payments";
import { revokeCertificate } from "@/lib/certificates";
import { requireAdmin } from "@/lib/auth";
import { adminRedirect } from "@/lib/admin-redirect";
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
    redirect(`/${locale}/dashboard/enrollments/${enrollment.id}?toast=success&msg=${encodeURIComponent("Enrolled successfully")}`);
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
    adminRedirect(`/${locale}/dashboard`, "Payment confirmed — you are enrolled!");
  }
  adminRedirect(`/${locale}/payment/${paymentId}?failed=1`, "Payment failed", "error");
}

export async function revokeCertificateAction(id: string, reason: string, locale: string) {
  await requireAdmin();
  await revokeCertificate(id, reason);
  revalidatePath(`/${locale}/admin/certificates`);
}

export async function createOrganization(locale: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "");
  const type = String(formData.get("type") ?? "");
  const contactEmail = String(formData.get("contactEmail") ?? "");
  const seats = Number(formData.get("seats") ?? 0);

  await db.organization.create({ data: { name, type, contactEmail, seats } });
  revalidatePath(`/${locale}/admin/organizations`);
  adminRedirect(`/${locale}/admin/organizations`, "Organization created");
}

export async function updateEnrollmentProgress(enrollmentId: string, progressPct: number, locale: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.enrollment.updateMany({
    where: { id: enrollmentId, userId: session.user.id },
    data: { progressPct: Math.min(100, Math.max(0, progressPct)) },
  });
  revalidatePath(`/${locale}/dashboard`);
  adminRedirect(`/${locale}/dashboard/enrollments/${enrollmentId}`, "Progress updated");
}
