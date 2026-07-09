import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { localizedField } from "@/lib/utils";
import { levelName } from "@/lib/levels";
import { generateCertificateQR } from "@/lib/qr";
import { CertificateDisplay } from "@/components/public/certificate-display";
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

  const [user, certificates] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true, imageUrl: true },
    }),
    db.certificateIssued.findMany({
      where: { userId: session.user.id },
      include: { certification: { include: { level: true } } },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const items = await Promise.all(
    certificates.map(async (cert) => {
      const isExpired = !!(cert.expiresAt && cert.expiresAt < new Date());
      const effectiveStatus = isExpired && cert.status === "VALID" ? "EXPIRED" : cert.status;
      const qrDataUrl = await generateCertificateQR(cert.uniqueCode);
      return { cert, effectiveStatus, qrDataUrl };
    })
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">{t("myCertificates")}</h1>
      {items.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map(({ cert, effectiveStatus, qrDataUrl }) => (
              <CertificateDisplay
                key={cert.id}
                uniqueCode={cert.uniqueCode}
                status={cert.status}
                level={levelName(cert.certification.level, locale)}
                title={localizedField(cert.certification, "title", locale)}
                holderName={user.name}
                holderImageUrl={user.imageUrl}
                issuedAt={cert.issuedAt.toISOString()}
                expiresAt={cert.expiresAt?.toISOString() ?? null}
                qrDataUrl={qrDataUrl}
                locale={locale}
                statusLabel={ts(effectiveStatus)}
                compact
                verifyHref={`/dashboard/verify/${cert.uniqueCode}`}
                labels={{
                  holder: tv("holder"),
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
          <p className="mt-6 text-sm text-ink-muted">{t("noCertificates")}</p>
        )}
    </div>
  );
}
