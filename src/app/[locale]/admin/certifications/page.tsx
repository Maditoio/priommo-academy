import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { CertificationsAdmin } from "@/components/admin/certifications-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";

export default async function AdminCertificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string; modal?: string; id?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const tc = await getTranslations("common");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 10);

  const te = await getTranslations("exam");

  const [certs, total, courses, levels, editCert] = await Promise.all([
    db.certification.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { rank: "asc" },
      include: {
        level: true,
        course: { select: { titleFr: true } },
        _count: { select: { issued: true } },
      },
    }),
    db.certification.count(),
    db.course.findMany({ orderBy: { titleFr: "asc" }, select: { id: true, titleFr: true } }),
    db.certificationLevel.findMany({ orderBy: { rank: "asc" } }),
    sp.modal === "edit" && sp.id
      ? db.certification.findUnique({ where: { id: sp.id } })
      : Promise.resolve(null),
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
    createCertification: ta("createCertification"),
    edit: tc("edit"),
    save: tc("save"),
    cancel: tc("cancel"),
    titleFr: ta("titleFr"),
    titleEn: ta("titleEn"),
    descriptionFr: ta("descriptionFr"),
    descriptionEn: ta("descriptionEn"),
    slug: ta("slug"),
    level: ta("level"),
    rank: "Rank",
    validityMonths: locale === "fr" ? "Validité (mois)" : "Validity (months)",
    linkedCourse: ta("linkedCourse"),
  };

  return (
    <AdminShell locale={locale} labels={labels} currentPath="/admin/certifications">
      <div className="flex items-center justify-between">
        <h1 className="text-[1.875rem] font-semibold text-ink">{ta("certifications")}</h1>
        <Button asChild>
          <Link href="/admin/certifications?modal=create">
            <MaterialIcon name="add" size={18} />
            {ta("createCertification")}
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        <DataTable
          columns={[
            { key: "rank", header: "#", cell: (r) => r.rank },
            { key: "title", header: ta("titleFr"), cell: (r) => r.titleFr },
            {
              key: "level",
              header: ta("level"),
              cell: (r) => <Badge variant="level">{r.level.nameFr}</Badge>,
            },
            { key: "course", header: ta("linkedCourse"), cell: (r) => r.course?.titleFr ?? "—" },
            { key: "issued", header: ta("certificates"), cell: (r) => r._count.issued },
            {
              key: "actions",
              header: tc("actions"),
              cell: (r) => (
                <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                  <Link href={`/admin/certifications?modal=edit&id=${r.id}`} title={tc("edit")} aria-label={tc("edit")}>
                    <MaterialIcon name="edit" size={18} />
                  </Link>
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

      <Suspense>
        <CertificationsAdmin
          locale={locale}
          levels={levels}
          courses={courses}
          labels={labels}
          editCert={editCert}
        />
      </Suspense>
    </AdminShell>
  );
}
