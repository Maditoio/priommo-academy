import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createOrganization } from "@/actions/enrollment";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";

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
  };

  return (
    <AdminShell labels={labels} currentPath="/admin/organizations">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">{ta("organizations")}</h1>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form action={createOrganization} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input name="type" placeholder="agence, banque..." required />
            </div>
            <div className="space-y-2">
              <Label>Contact email</Label>
              <Input name="contactEmail" type="email" required />
            </div>
            <div className="space-y-2">
              <Label>Seats</Label>
              <Input name="seats" type="number" defaultValue={10} required />
            </div>
            <Button type="submit" className="sm:col-span-2 w-fit">{ta("createOrganization")}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "name", header: "Name", cell: (r) => r.name },
            { key: "type", header: "Type", cell: (r) => r.type },
            { key: "email", header: "Email", cell: (r) => r.contactEmail },
            { key: "seats", header: "Seats", cell: (r) => r.seats },
            { key: "members", header: "Members", cell: (r) => r._count.members },
          ]}
          data={orgs}
        />
      </div>
      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} showingLabel={ta("showing")} pageSizeLabel={ta("pageSize")} />
      </div>
    </AdminShell>
  );
}
