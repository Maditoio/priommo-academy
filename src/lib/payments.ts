import { db } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";

export type PaymentProvider = "mock" | "orange_money" | "airtel_money" | "card";

export async function initiatePayment(params: {
  userId: string;
  amount: number;
  currency?: string;
  provider?: PaymentProvider;
  relatedType: "course" | "certification";
  relatedId: string;
}) {
  return db.payment.create({
    data: {
      userId: params.userId,
      amount: params.amount,
      currency: params.currency ?? "USD",
      provider: params.provider ?? "mock",
      status: PaymentStatus.PENDING,
      relatedType: params.relatedType,
      relatedId: params.relatedId,
    },
  });
}

export async function confirmPayment(paymentId: string, success: boolean) {
  const payment = await db.payment.findUniqueOrThrow({ where: { id: paymentId } });

  if (payment.status !== PaymentStatus.PENDING) {
    throw new Error("Payment already processed");
  }

  if (!success) {
    return db.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
    });
  }

  const updatedPayment = await db.payment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.PAID },
  });

  if (payment.relatedType === "course") {
    await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.relatedId,
        },
      },
      create: {
        userId: payment.userId,
        courseId: payment.relatedId,
        status: "ACTIVE",
      },
      update: { status: "ACTIVE" },
    });
  }

  return updatedPayment;
}

export async function enrollInFreeCourse(userId: string, courseId: string) {
  return db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });
}
