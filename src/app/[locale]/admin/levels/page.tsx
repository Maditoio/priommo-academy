import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createLevel, updateLevel, deleteLevel } from "@/actions/levels";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { LevelsAdmin } from "@/components/admin/levels-admin";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function AdminLevelsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ modal?: string; id?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const tc = await getTranslations("common");
  const te = await getTranslations("exam");

  const [levels, editLevel] = await Promise.all([
    db.certificationLevel.findMany({ orderBy: { rank: "asc" } }),
    sp.modal === "edit" && sp.id
      ? db.certificationLevel.findUnique({ where: { id: sp.id } })
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
  };

  return (
    <AdminShell locale={locale} labels={labels} currentPath="/admin/levels">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-[1.875rem] font-semibold text-ink">
          <MaterialIcon name="signal_cellular_alt" className="text-accent" size={28} />
          {te("levels")}
        </h1>
        <Button asChild>
          <Link href="/admin/levels?modal=create">
            <MaterialIcon name="add" size={18} />
            {te("addLevel")}
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "rank", header: "#", cell: (r) => r.rank },
            { key: "name", header: te("levelName"), cell: (r) => r.nameFr },
            { key: "slug", header: "Slug", cell: (r) => r.slug },
            {
              key: "actions",
              header: tc("actions"),
              cell: (r) => (
                <div className="flex gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/levels?modal=edit&id=${r.id}`}>
                      <MaterialIcon name="edit" size={18} />
                      {tc("edit")}
                    </Link>
                  </Button>
                  <form action={deleteLevel.bind(null, r.id, locale)}>
                    <Button type="submit" variant="ghost" size="sm">
                      <MaterialIcon name="delete" size={18} />
                    </Button>
                  </form>
                </div>
              ),
            },
          ]}
          data={levels}
        />
      </div>

      <Suspense>
        <LevelsAdmin locale={locale} editLevel={editLevel} labels={labels} />
      </Suspense>
    </AdminShell>
  );
}
