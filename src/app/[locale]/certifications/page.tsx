import { db } from "@/lib/db";
import { CertificationCard } from "@/components/public/certification-card";
import { Pagination } from "@/components/admin/pagination";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function CertificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("certifications");
  const tc = await getTranslations("courses");
  const ta = await getTranslations("admin");

  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 9);

  const [certifications, total] = await Promise.all([
    db.certification.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { course: { select: { slug: true, titleFr: true, titleEn: true } } },
    }),
    db.certification.count(),
  ]);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        {certifications.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <CertificationCard
                key={cert.id}
                certification={cert}
                locale={locale}
                viewLabel={tc("overview")}
                levelLabel={tc("level")}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">{t("noCertifications")}</p>
        )}

        <div className="mt-8">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            showingLabel={ta("showing")}
            pageSizeLabel={ta("pageSize")}
          />
        </div>
      </div>
    </div>
  );
}
