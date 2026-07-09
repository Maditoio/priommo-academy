import { db } from "@/lib/db";
import { generateCertificateQR } from "@/lib/qr";
import { nanoid } from "nanoid";

function computeExpiresAt(validityMonths: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + validityMonths);
  return d;
}

export async function issueCertificateAfterPass(params: {
  userId: string;
  examId: string;
  courseId: string;
}) {
  const exam = await db.exam.findUniqueOrThrow({
    where: { id: params.examId },
    include: {
      course: {
        include: {
          certifications: { orderBy: { rank: "asc" }, include: { level: true } },
        },
      },
    },
  });

  const certification = exam.course.certifications[0];
  if (!certification) {
    await db.enrollment.updateMany({
      where: { userId: params.userId, courseId: params.courseId },
      data: { status: "COMPLETED", completedAt: new Date(), progressPct: 100 },
    });
    return { certificate: null, qrDataUrl: null };
  }

  const existing = await db.certificateIssued.findFirst({
    where: { userId: params.userId, certificationId: certification.id },
  });

  if (existing) {
    const qrDataUrl = await generateCertificateQR(existing.uniqueCode);
    await db.enrollment.updateMany({
      where: { userId: params.userId, courseId: params.courseId },
      data: { status: "COMPLETED", completedAt: new Date(), progressPct: 100 },
    });
    return { certificate: existing, qrDataUrl };
  }

  const uniqueCode = nanoid(10);
  const expiresAt = computeExpiresAt(certification.validityMonths);

  const certificate = await db.$transaction(async (tx) => {
    const cert = await tx.certificateIssued.create({
      data: {
        uniqueCode,
        certificationId: certification.id,
        userId: params.userId,
        status: "VALID",
        expiresAt,
      },
      include: { certification: { include: { level: true } }, user: true },
    });

    await tx.enrollment.updateMany({
      where: { userId: params.userId, courseId: params.courseId },
      data: { status: "COMPLETED", completedAt: new Date(), progressPct: 100 },
    });

    return cert;
  });

  const qrDataUrl = await generateCertificateQR(certificate.uniqueCode);
  return { certificate, qrDataUrl };
}

export async function revokeCertificate(id: string, reason: string) {
  return db.certificateIssued.update({
    where: { id },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}
