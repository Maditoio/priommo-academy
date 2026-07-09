import { db } from "@/lib/db";
import { StatusBadge } from "@/components/public/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { ShieldCheck, ShieldX } from "lucide-react";

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
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <ShieldX className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-xl font-semibold">{t("notFound")}</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = certificate.expiresAt && certificate.expiresAt < new Date();
  const effectiveStatus = isExpired && certificate.status === "VALID" ? "EXPIRED" : certificate.status;

  const statusLabels: Record<string, string> = {
    VALID: t("valid"),
    REVOKED: t("revoked"),
    EXPIRED: t("expired"),
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          {effectiveStatus === "VALID" ? (
            <ShieldCheck className="mx-auto h-12 w-12 text-emerald-600" />
          ) : (
            <ShieldX className="mx-auto h-12 w-12 text-destructive" />
          )}
          <CardTitle className="mt-4">{t("title")}</CardTitle>
          <div className="mt-2 flex justify-center">
            <StatusBadge status={effectiveStatus} label={statusLabels[effectiveStatus]} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between border-b py-2">
            <span className="text-muted-foreground">{t("holder")}</span>
            <span className="font-medium">{certificate.user.name}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-muted-foreground">{t("certification")}</span>
            <span className="font-medium">
              {locale === "fr" ? certificate.certification.titleFr : certificate.certification.titleEn}
            </span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-muted-foreground">{t("issuedAt")}</span>
            <span className="font-medium">
              {format(certificate.issuedAt, "PPP", { locale: dateLocale })}
            </span>
          </div>
          {certificate.status === "REVOKED" && certificate.revokedReason && (
            <div className="rounded-md bg-red-50 p-4 text-sm">
              <p className="font-medium text-red-800">{t("reason")}</p>
              <p className="mt-1 text-red-700">{certificate.revokedReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
