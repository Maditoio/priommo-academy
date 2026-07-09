import { db } from "@/lib/db";
import {
  VerificationSeal,
  sealStatusFromCertificate,
} from "@/components/public/verification-seal";
import { StatusBadge } from "@/components/public/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("verify");
  const ts = await getTranslations("status");
  const dateLocale = locale === "fr" ? fr : enUS;

  const certificate = await db.certificateIssued.findUnique({
    where: { uniqueCode: code },
    include: { user: true, certification: true },
  });

  if (!certificate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8 text-center">
          <VerificationSeal status="revoked" code="NOT-FOUND" size="md" className="mx-auto" />
          <h1 className="font-display mt-6 text-2xl font-semibold text-navy">{t("notFound")}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {locale === "fr"
              ? "Ce code de vérification ne correspond à aucun certificat enregistré."
              : "This verification code does not match any registered certificate."}
          </p>
        </Card>
      </div>
    );
  }

  const isExpired = !!(certificate.expiresAt && certificate.expiresAt < new Date());
  const effectiveStatus =
    isExpired && certificate.status === "VALID" ? "EXPIRED" : certificate.status;
  const sealStatus = sealStatusFromCertificate(effectiveStatus, isExpired);

  const statusLabels: Record<string, string> = {
    VALID: t("valid"),
    REVOKED: t("revoked"),
    EXPIRED: t("expired"),
  };

  const certTitle =
    locale === "fr" ? certificate.certification.titleFr : certificate.certification.titleEn;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-lg overflow-hidden">
        <div className="border-b border-navy/10 bg-navy/5 px-8 py-10 text-center">
          <VerificationSeal
            status={sealStatus}
            code={certificate.uniqueCode}
            level={certificate.certification.level}
            size="lg"
            className="mx-auto"
          />
          <h1 className="font-display mt-8 text-2xl font-semibold text-navy">{t("title")}</h1>
          <div className="mt-3 flex justify-center">
            <StatusBadge status={effectiveStatus} label={statusLabels[effectiveStatus]} />
          </div>
        </div>
        <CardContent className="space-y-0 p-0">
          <div className="flex justify-between border-b border-navy/10 px-8 py-4">
            <span className="text-sm text-ink-muted">{t("holder")}</span>
            <span className="font-medium text-ink">{certificate.user.name}</span>
          </div>
          <div className="flex justify-between border-b border-navy/10 px-8 py-4">
            <span className="text-sm text-ink-muted">{t("certification")}</span>
            <span className="max-w-[60%] text-right font-medium text-ink">{certTitle}</span>
          </div>
          <div className="flex justify-between px-8 py-4">
            <span className="text-sm text-ink-muted">{t("issuedAt")}</span>
            <span className="font-medium text-ink">
              {format(certificate.issuedAt, "PPP", { locale: dateLocale })}
            </span>
          </div>
          {certificate.status === "REVOKED" && certificate.revokedReason && (
            <div className="border-t border-clay/20 bg-clay/5 px-8 py-4 text-sm">
              <p className="font-medium text-clay">{t("reason")}</p>
              <p className="mt-1 text-ink-muted">{certificate.revokedReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
