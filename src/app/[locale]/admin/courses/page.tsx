import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function AdminCoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string; search?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const tc = await getTranslations("common");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 10);

  const where = sp.search
    ? {
        OR: [
          { titleFr: { contains: sp.search, mode: "insensitive" as const } },
          { titleEn: { contains: sp.search, mode: "insensitive" as const } },
          { slug: { contains: sp.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { enrollments: true } } },
    }),
    db.course.count({ where }),
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
    <AdminShell labels={labels} currentPath="/admin/courses">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{ta("courses")}</h1>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            {ta("createCourse")}
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "title", header: ta("titleFr"), cell: (r) => r.titleFr },
            { key: "slug", header: ta("slug"), cell: (r) => r.slug },
            { key: "level", header: ta("level"), cell: (r) => r.level },
            {
              key: "price",
              header: ta("price"),
              cell: (r) => formatPrice(r.price.toString(), r.currency, locale),
            },
            {
              key: "status",
              header: "Status",
              cell: (r) => (
                <StatusBadge
                  status={r.published ? "PUBLISHED" : "DRAFT"}
                  label={r.published ? tc("published") : tc("draft")}
                />
              ),
            },
            {
              key: "enrollments",
              header: ta("enrollments"),
              cell: (r) => r._count.enrollments,
            },
            {
              key: "actions",
              header: ta("courses"),
              cell: (r) => (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/courses/${r.id}`}>{tc("edit")}</Link>
                </Button>
              ),
            },
          ]}
          data={courses}
        />
      </div>

      <div className="mt-4">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          showingLabel={ta("showing")}
          pageSizeLabel={ta("pageSize")}
        />
      </div>
    </AdminShell>
  );
}
