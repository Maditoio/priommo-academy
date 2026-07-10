import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateUserRole } from "@/actions/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { format } from "date-fns";

export default async function AdminUsersPage({
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
  const te = await getTranslations("exam");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 10);

  const where = sp.search
    ? {
        OR: [
          { name: { contains: sp.search, mode: "insensitive" as const } },
          { email: { contains: sp.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { organization: true },
    }),
    db.user.count({ where }),
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
    <AdminShell locale={locale} labels={labels} currentPath="/admin/users">
      <h1 className="text-[1.875rem] font-semibold text-ink">{ta("users")}</h1>
      <div className="mt-6">
        <DataTable
          columns={[
            { key: "name", header: "Name", cell: (r) => r.name },
            { key: "email", header: "Email", cell: (r) => r.email },
            { key: "role", header: ta("role"), cell: (r) => r.role },
            { key: "org", header: ta("organization"), cell: (r) => r.organization?.name ?? "—" },
            { key: "date", header: "Joined", cell: (r) => format(r.createdAt, "PP") },
            {
              key: "actions",
              header: ta("role"),
              cell: (r) => (
                <div className="flex gap-1">
                  {(["LEARNER", "ADMIN", "ORG_ADMIN"] as const).map((role) => (
                    <form key={role} action={updateUserRole.bind(null, r.id, role)}>
                      <Button type="submit" variant={r.role === role ? "default" : "ghost"} size="sm">
                        {role}
                      </Button>
                    </form>
                  ))}
                </div>
              ),
            },
          ]}
          data={users}
        />
      </div>
      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} showingLabel={ta("showing")} pageSizeLabel={ta("pageSize")} />
      </div>
    </AdminShell>
  );
}
