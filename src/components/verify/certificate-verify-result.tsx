import { db } from "@/lib/db";
import { generateCertificateQR } from "@/lib/qr";
import { CertificateDisplay } from "@/components/public/certificate-display";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { levelName } from "@/lib/levels";
import { VerificationSeal } from "@/components/public/verification-seal";

interface CertificateVerifyResultProps {
  locale: string;
  code: string;
  variant?: "public" | "learner";
}

export async function CertificateVerifyResult({
  locale,
  code,
  variant = "public",
}: CertificateVerifyResultProps) {
  const t = await getTranslations("verify");
  const isLearner = variant === "learner";

  const certificate = await db.certificateIssued.findUnique({
    where: { uniqueCode: code },
    include: { user: true, certification: { include: { level: true } } },
  });

  if (!certificate) {
    return (
      <div className={isLearner ? "py-4" : "flex min-h-[60vh] items-center justify-center px-6 py-16"}>
        <Card className="mx-auto w-full max-w-md p-8 text-center shadow-sm">
          <VerificationSeal status="revoked" code="NOT-FOUND" size="md" className="mx-auto" />
          <h1 className="mt-6 text-xl font-semibold text-ink">{t("notFound")}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {locale === "fr"
              ? "Ce code ne correspond à aucun certificat enregistré."
              : "This code does not match any registered certificate."}
          </p>
        </Card>
      </div>
    );
  }

  const isExpired = !!(certificate.expiresAt && certificate.expiresAt < new Date());
  const effectiveStatus =
    isExpired && certificate.status === "VALID" ? "EXPIRED" : certificate.status;
  const qrDataUrl = await generateCertificateQR(certificate.uniqueCode);
  const certTitle =
    locale === "fr" ? certificate.certification.titleFr : certificate.certification.titleEn;

  const statusLabels: Record<string, string> = {
    VALID: t("valid"),
    REVOKED: t("revoked"),
    EXPIRED: t("expired"),
  };

  return (
    <div className={isLearner ? "space-y-6" : "px-6 py-16"}>
      <div className={isLearner ? "max-w-lg" : "mx-auto max-w-lg"}>
        <div className="mb-8 text-center">
          <h1 className={isLearner ? "text-xl font-semibold text-ink" : "text-[1.875rem] font-semibold text-ink"}>
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {locale === "fr"
              ? "Vérification officielle PROIMMO Academy"
              : "Official PROIMMO Academy verification"}
          </p>
        </div>

        <CertificateDisplay
          uniqueCode={certificate.uniqueCode}
          status={certificate.status}
          level={levelName(certificate.certification.level, locale)}
          title={certTitle}
          holderName={certificate.user.name}
          holderImageUrl={certificate.user.imageUrl}
          issuedAt={certificate.issuedAt.toISOString()}
          expiresAt={certificate.expiresAt?.toISOString() ?? null}
          qrDataUrl={qrDataUrl}
          locale={locale}
          statusLabel={statusLabels[effectiveStatus]}
          labels={{
            holder: t("holder"),
            issuedAt: t("issuedAt"),
            expiresAt: t("expiresAt"),
            verify: t("viewOnline"),
            copyLink: t("copyLink"),
            copied: t("copied"),
          }}
        />

        {certificate.status === "REVOKED" && certificate.revokedReason && (
          <Card className="mt-8 border-danger/20 bg-danger/5 shadow-sm">
            <CardContent className="pt-6">
              <p className="font-medium text-danger">{t("reason")}</p>
              <p className="mt-1 text-sm text-ink-muted">{certificate.revokedReason}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
