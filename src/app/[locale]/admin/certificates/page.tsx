import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { RevokeCertificateButton } from "@/components/admin/revoke-certificate-button";
import { VerificationSeal, sealStatusFromCertificate } from "@/components/public/verification-seal";
import { StatusBadge } from "@/components/public/status-badge";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { format } from "date-fns";

export default async function AdminCertificatesPage({
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
  const ts = await getTranslations("status");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 10);

  const where = sp.search
    ? {
        OR: [
          { uniqueCode: { contains: sp.search, mode: "insensitive" as const } },
          { user: { name: { contains: sp.search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [certificates, total] = await Promise.all([
    db.certificateIssued.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { issuedAt: "desc" },
      include: { user: true, certification: true },
    }),
    db.certificateIssued.count({ where }),
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
    <AdminShell locale={locale} labels={labels} currentPath="/admin/certificates">
      <h1 className="text-[1.875rem] font-semibold text-ink">{ta("certificates")}</h1>
      <div className="mt-6">
        <DataTable
          columns={[
            { key: "code", header: "Code", cell: (r) => (
              <div className="flex items-center gap-3">
                <VerificationSeal
                  status={sealStatusFromCertificate(r.status)}
                  code={r.uniqueCode}
                  size="sm"
                />
              </div>
            ) },
            { key: "user", header: ta("users"), cell: (r) => r.user.name },
            { key: "cert", header: ta("certifications"), cell: (r) => r.certification.titleFr },
            {
              key: "status",
              header: "Status",
              cell: (r) => <StatusBadge status={r.status} label={ts(r.status)} />,
            },
            { key: "date", header: "Issued", cell: (r) => format(r.issuedAt, "PP") },
            {
              key: "verify",
              header: "",
              cell: (r) => (
                <Link href={`/verify/${r.uniqueCode}`} className="text-sm text-primary hover:underline">
                  Verify
                </Link>
              ),
            },
            {
              key: "actions",
              header: "",
              cell: (r) =>
                r.status === "VALID" ? (
                  <RevokeCertificateButton
                    id={r.id}
                    label={ta("revoke")}
                    locale={locale}
                    reasonLabel={ta("revokeReason")}
                    confirmLabel={ta("revoke")}
                    cancelLabel="Cancel"
                  />
                ) : null,
            },
          ]}
          data={certificates}
        />
      </div>
      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} showingLabel={ta("showing")} pageSizeLabel={ta("pageSize")} />
      </div>
    </AdminShell>
  );
}
