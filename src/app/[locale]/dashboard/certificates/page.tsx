import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { localizedField } from "@/lib/utils";
import { generateCertificateQR } from "@/lib/qr";
import { CertificateDisplay } from "@/components/public/certificate-display";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("dashboard");
  const ts = await getTranslations("status");
  const tv = await getTranslations("verify");

  const certificates = await db.certificateIssued.findMany({
    where: { userId: session.user.id },
    include: { certification: true },
    orderBy: { issuedAt: "desc" },
  });

  const items = await Promise.all(
    certificates.map(async (cert) => {
      const isExpired = !!(cert.expiresAt && cert.expiresAt < new Date());
      const effectiveStatus = isExpired && cert.status === "VALID" ? "EXPIRED" : cert.status;
      const qrDataUrl = await generateCertificateQR(cert.uniqueCode);
      return { cert, effectiveStatus, qrDataUrl };
    })
  );

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Link href="/dashboard" className="text-sm text-accent hover:underline">
          ← {t("title")}
        </Link>
        <h1 className="mt-4 text-[1.875rem] font-semibold text-ink sm:text-4xl">{t("myCertificates")}</h1>

        {items.length > 0 ? (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ cert, effectiveStatus, qrDataUrl }) => (
              <CertificateDisplay
                key={cert.id}
                uniqueCode={cert.uniqueCode}
                status={cert.status}
                level={cert.certification.level}
                title={localizedField(cert.certification, "title", locale)}
                issuedAt={cert.issuedAt.toISOString()}
                expiresAt={cert.expiresAt?.toISOString() ?? null}
                qrDataUrl={qrDataUrl}
                locale={locale}
                statusLabel={ts(effectiveStatus)}
                compact
                labels={{
                  issuedAt: tv("issuedAt"),
                  expiresAt: tv("expiresAt"),
                  verify: t("viewCertificate"),
                  copyLink: tv("copyLink"),
                  copied: tv("copied"),
                }}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-ink-muted">{t("noCertificates")}</p>
        )}
      </div>
    </div>
  );
}
