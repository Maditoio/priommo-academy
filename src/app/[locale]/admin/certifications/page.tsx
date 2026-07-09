import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

function adminLabels(ta: Awaited<ReturnType<typeof getTranslations>>) {
  return {
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
}

export default async function AdminCertificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const tc = await getTranslations("common");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 10);

  const [certs, total] = await Promise.all([
    db.certification.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { course: { select: { titleFr: true } }, _count: { select: { issued: true } } },
    }),
    db.certification.count(),
  ]);

  return (
    <AdminShell labels={adminLabels(ta)} currentPath="/admin/certifications">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{ta("certifications")}</h1>
        <Button asChild>
          <Link href="/admin/certifications/new">
            <Plus className="mr-2 h-4 w-4" />
            {ta("createCertification")}
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        <DataTable
          columns={[
            { key: "title", header: ta("titleFr"), cell: (r) => r.titleFr },
            { key: "slug", header: ta("slug"), cell: (r) => r.slug },
            { key: "level", header: ta("level"), cell: (r) => r.level },
            { key: "course", header: ta("linkedCourse"), cell: (r) => r.course?.titleFr ?? "—" },
            { key: "issued", header: ta("certificates"), cell: (r) => r._count.issued },
            {
              key: "actions",
              header: tc("actions"),
              cell: (r) => (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/certifications/${r.id}`}>{tc("edit")}</Link>
                </Button>
              ),
            },
          ]}
          data={certs}
        />
      </div>
      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} showingLabel={ta("showing")} pageSizeLabel={ta("pageSize")} />
      </div>
    </AdminShell>
  );
}
