import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Users, BookOpen, Award, DollarSign } from "lucide-react";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");

  const [learners, activeEnrollments, certificatesIssued, revenue] = await Promise.all([
    db.user.count({ where: { role: "LEARNER" } }),
    db.enrollment.count({ where: { status: "ACTIVE" } }),
    db.certificateIssued.count({ where: { status: "VALID" } }),
    db.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const stats = [
    { label: ta("learners"), value: learners, icon: Users },
    { label: ta("activeEnrollments"), value: activeEnrollments, icon: BookOpen },
    { label: ta("certificatesIssued"), value: certificatesIssued, icon: Award },
    {
      label: ta("revenue"),
      value: `$${parseFloat(revenue._sum.amount?.toString() ?? "0").toFixed(2)}`,
      icon: DollarSign,
    },
  ];

  return (
    <AdminShell labels={{ title: ta("title"), ...Object.fromEntries(
      ["overview", "courses", "certifications", "enrollments", "certificates", "users", "organizations", "payments"].map(k => [k, ta(k as "overview")])
    ) }} currentPath="/admin">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">{ta("overview")}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-ink-muted">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-gold" />
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-semibold text-navy">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminShell>
  );
}
