import { db } from "@/lib/db";
import { generateCertificateQR } from "@/lib/qr";
import { nanoid } from "nanoid";

export async function issueCertificateOnExamPass(params: {
  userId: string;
  examId: string;
  score: number;
}) {
  const exam = await db.exam.findUniqueOrThrow({
    where: { id: params.examId },
    include: {
      course: {
        include: {
          certifications: true,
          enrollments: { where: { userId: params.userId } },
        },
      },
    },
  });

  const passed = params.score >= exam.passingScore;

  const attempt = await db.examAttempt.create({
    data: {
      examId: params.examId,
      userId: params.userId,
      score: params.score,
      passed,
    },
  });

  if (!passed) {
    return { attempt, certificate: null, qrDataUrl: null };
  }

  const certification = exam.course.certifications[0];
  if (!certification) {
    await db.enrollment.updateMany({
      where: { userId: params.userId, courseId: exam.courseId },
      data: { status: "COMPLETED", completedAt: new Date(), progressPct: 100 },
    });
    return { attempt, certificate: null, qrDataUrl: null };
  }

  const existing = await db.certificateIssued.findFirst({
    where: { userId: params.userId, certificationId: certification.id },
  });

  if (existing) {
    return { attempt, certificate: existing, qrDataUrl: null };
  }

  const uniqueCode = nanoid(10);
  const certificate = await db.$transaction(async (tx) => {
    const cert = await tx.certificateIssued.create({
      data: {
        uniqueCode,
        certificationId: certification.id,
        userId: params.userId,
        status: "VALID",
      },
      include: { certification: true, user: true },
    });

    await tx.enrollment.updateMany({
      where: { userId: params.userId, courseId: exam.courseId },
      data: { status: "COMPLETED", completedAt: new Date(), progressPct: 100 },
    });

    return cert;
  });

  const qrDataUrl = await generateCertificateQR(certificate.uniqueCode);
  return { attempt, certificate, qrDataUrl };
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
