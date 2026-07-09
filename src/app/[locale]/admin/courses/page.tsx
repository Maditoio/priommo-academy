import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { CoursesAdmin } from "@/components/admin/courses-admin";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatPrice } from "@/lib/utils";
import { Suspense } from "react";

export default async function AdminCoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    modal?: string;
    id?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const tc = await getTranslations("common");
  const te = await getTranslations("exam");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 10);

  const where = sp.search
    ? {
        OR: [
          { titleFr: { contains: sp.search, mode: "insensitive" as const } },
          { titleEn: { contains: sp.search, mode: "insensitive" as const } },
          { titleFr: { contains: sp.search, mode: "insensitive" as const } },
          { titleEn: { contains: sp.search, mode: "insensitive" as const } },
          { slug: { contains: sp.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [courses, total, editCourse, levels] = await Promise.all([
    db.course.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      include: {
        level: true,
        _count: { select: { enrollments: true, modules: true } },
      },
    }),
    db.course.count({ where }),
    sp.modal === "edit" && sp.id
      ? db.course.findUnique({ where: { id: sp.id } })
      : Promise.resolve(null),
    db.certificationLevel.findMany({ orderBy: { rank: "asc" } }),
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
    levels: te("levels"),
    createCourse: ta("createCourse"),
    edit: tc("edit"),
    save: tc("save"),
    cancel: tc("cancel"),
    titleFr: ta("titleFr"),
    titleEn: ta("titleEn"),
    descriptionFr: ta("descriptionFr"),
    descriptionEn: ta("descriptionEn"),
    slug: ta("slug"),
    level: ta("level"),
    price: ta("price"),
    currency: ta("currency"),
    imageUrl: ta("imageUrl"),
    publish: ta("publish"),
  };

  return (
    <AdminShell labels={labels} currentPath="/admin/courses">
      <div className="flex items-center justify-between">
        <h1 className="text-[1.875rem] font-semibold text-ink">{ta("courses")}</h1>
        <Button asChild>
          <Link href="/admin/courses?modal=create">
            <MaterialIcon name="add" size={18} />
            {ta("createCourse")}
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "title", header: ta("titleFr"), cell: (r) => r.titleFr },
            { key: "titleFr", header: ta("titleFr"), cell: (r) => r.titleFr },
            { key: "level", header: ta("level"), cell: (r) => r.level.nameFr },
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
              key: "modules",
              header: ta("modules"),
              cell: (r) => r._count.modules,
            },
            {
              key: "enrollments",
              header: ta("enrollments"),
              cell: (r) => r._count.enrollments,
            },
            {
              key: "actions",
              header: tc("actions"),
              cell: (r) => (
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/courses/${r.id}`}>
                      <MaterialIcon name="visibility" size={18} />
                      {locale === "fr" ? "Voir" : "View"}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/courses?modal=edit&id=${r.id}`}>
                      <MaterialIcon name="edit" size={18} />
                      {tc("edit")}
                    </Link>
                  </Button>
                </div>
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

      <Suspense>
        <CoursesAdmin locale={locale} labels={labels} levels={levels} editCourse={editCourse} />
      </Suspense>
    </AdminShell>
  );
}
