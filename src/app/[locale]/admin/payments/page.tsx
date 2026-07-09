import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/public/status-badge";
import { formatPrice } from "@/lib/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { format } from "date-fns";

export default async function AdminPaymentsPage({
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

  const where = sp.status ? { status: sp.status as "PENDING" | "PAID" | "FAILED" | "REFUNDED" } : {};

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    db.payment.count({ where }),
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
    <AdminShell labels={labels} currentPath="/admin/payments">
      <h1 className="text-2xl font-bold">{ta("payments")}</h1>
      <div className="mt-6">
        <DataTable
          columns={[
            { key: "user", header: ta("users"), cell: (r) => r.user.name },
            {
              key: "amount",
              header: "Amount",
              cell: (r) => formatPrice(r.amount.toString(), r.currency, locale),
            },
            { key: "provider", header: "Provider", cell: (r) => r.provider },
            {
              key: "status",
              header: "Status",
              cell: (r) => <StatusBadge status={r.status} label={ts(r.status)} />,
            },
            { key: "type", header: "Type", cell: (r) => r.relatedType },
            { key: "date", header: "Date", cell: (r) => format(r.createdAt, "PP") },
          ]}
          data={payments}
        />
      </div>
      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} showingLabel={ta("showing")} pageSizeLabel={ta("pageSize")} />
      </div>
    </AdminShell>
  );
}
