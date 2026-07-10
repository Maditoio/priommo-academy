import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { OrganizationsAdmin } from "@/components/admin/organizations-admin";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function AdminOrganizationsPage({
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
  const te = await getTranslations("exam");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 10);

  const [orgs, total] = await Promise.all([
    db.organization.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { members: true } } },
    }),
    db.organization.count(),
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
  };

  const modalLabels = {
    createOrganization: ta("createOrganization"),
    save: tc("save"),
    cancel: tc("cancel"),
    orgName: ta("orgName"),
    orgType: ta("orgType"),
    orgEmail: ta("orgEmail"),
    orgSeats: ta("orgSeats"),
    createOrganizationDesc: ta("createOrganizationDesc"),
  };

  return (
    <AdminShell locale={locale} labels={labels} currentPath="/admin/organizations">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[1.875rem] font-semibold text-ink">{ta("organizations")}</h1>
        <Button asChild>
          <Link href="/admin/organizations?modal=create">
            <MaterialIcon name="add" size={18} />
            {ta("createOrganization")}
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "name", header: ta("orgName"), cell: (r) => r.name },
            { key: "type", header: ta("orgType"), cell: (r) => r.type },
            { key: "email", header: ta("orgEmail"), cell: (r) => r.contactEmail },
            { key: "seats", header: ta("orgSeats"), cell: (r) => r.seats },
            { key: "members", header: ta("members"), cell: (r) => r._count.members },
          ]}
          data={orgs}
          emptyMessage={ta("noOrganizations")}
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
        <OrganizationsAdmin locale={locale} labels={modalLabels} />
      </Suspense>
    </AdminShell>
  );
}
