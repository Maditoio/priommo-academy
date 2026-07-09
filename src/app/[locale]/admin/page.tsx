import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const te = await getTranslations("exam");

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
    { label: ta("learners"), value: learners, icon: "group" },
    { label: ta("activeEnrollments"), value: activeEnrollments, icon: "how_to_reg" },
    { label: ta("certificatesIssued"), value: certificatesIssued, icon: "verified" },
    {
      label: ta("revenue"),
      value: `$${parseFloat(revenue._sum.amount?.toString() ?? "0").toFixed(2)}`,
      icon: "payments",
    },
  ];

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
    <AdminShell labels={labels} currentPath="/admin">
      <h1 className="text-[1.875rem] font-semibold text-ink">{ta("overview")}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-ink-muted">{stat.label}</CardTitle>
              <MaterialIcon name={stat.icon} className="text-accent" size={20} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-ink">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
