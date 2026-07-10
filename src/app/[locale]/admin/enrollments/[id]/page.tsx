import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/public/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function AdminEnrollmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const te = await getTranslations("exam");
  const ts = await getTranslations("status");

  const enrollment = await db.enrollment.findUnique({
    where: { id },
    include: {
      user: true,
      course: true,
    },
  });

  if (!enrollment) notFound();

  const attempts = await db.examAttempt.findMany({
    where: { userId: enrollment.userId, exam: { courseId: enrollment.courseId } },
    include: { exam: true },
    orderBy: { attemptedAt: "desc" },
  });

  const labels = {
    title: ta("title"),
    overview: ta("overview"),
    courses: ta("courses"),
    certifications: ta("certifications"),
    enrollments: ta("enrollments"),
    certificates: ta("certificates"),
    users: ta("users"),
    organizations: ta("organizations"),
    payments: ta("payments"),
    levels: te("levels"),
  };

  return (
    <AdminShell locale={locale} labels={labels} currentPath="/admin/enrollments">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">{enrollment.user.name}</h1>
      <p className="text-muted-foreground">{enrollment.course.titleFr}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
          <CardContent>
            <StatusBadge status={enrollment.status} label={ts(enrollment.status)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Progress</CardTitle></CardHeader>
          <CardContent><p className="font-display text-3xl font-semibold tracking-tight text-navy">{enrollment.progressPct}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Enrolled</CardTitle></CardHeader>
          <CardContent><p>{format(enrollment.enrolledAt, "PPP")}</p></CardContent>
        </Card>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Exam attempts</h2>
      {attempts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {attempts.map((a) => (
            <li key={a.id} className="flex items-center gap-4 rounded border bg-white p-3 text-sm">
              <span>{a.exam.titleFr}</span>
              <span>{a.score}%</span>
              <StatusBadge status={a.passed ? "VALID" : "FAILED"} label={a.passed ? "Passed" : "Failed"} />
              <span className="text-muted-foreground">{format(a.attemptedAt, "PP")}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-muted-foreground">No exam attempts yet.</p>
      )}
    </AdminShell>
  );
}
