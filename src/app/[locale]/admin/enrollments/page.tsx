import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { format } from "date-fns";

export default async function AdminEnrollmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string; status?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const ts = await getTranslations("status");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 10);

  const where = sp.status ? { status: sp.status as "ACTIVE" | "COMPLETED" | "DROPPED" } : {};

  const [enrollments, total] = await Promise.all([
    db.enrollment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { enrolledAt: "desc" },
      include: { user: true, course: true },
    }),
    db.enrollment.count({ where }),
  ]);

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
  };

  return (
    <AdminShell labels={labels} currentPath="/admin/enrollments">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">{ta("enrollments")}</h1>
      <div className="mt-6">
        <DataTable
          columns={[
            { key: "user", header: ta("users"), cell: (r) => r.user.name },
            { key: "course", header: ta("courses"), cell: (r) => r.course.titleFr },
            {
              key: "status",
              header: "Status",
              cell: (r) => <StatusBadge status={r.status} label={ts(r.status)} />,
            },
            { key: "progress", header: "Progress", cell: (r) => `${r.progressPct}%` },
            {
              key: "date",
              header: "Date",
              cell: (r) => format(r.enrolledAt, "PP"),
            },
            {
              key: "actions",
              header: "",
              cell: (r) => (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/enrollments/${r.id}`}>View</Link>
                </Button>
              ),
            },
          ]}
          data={enrollments}
        />
      </div>
      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} showingLabel={ta("showing")} pageSizeLabel={ta("pageSize")} />
      </div>
    </AdminShell>
  );
}
