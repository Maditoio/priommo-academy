import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { localizedField } from "@/lib/utils";
import {
  VerificationSeal,
  sealStatusFromCertificate,
} from "@/components/public/verification-seal";
import { StatusBadge } from "@/components/public/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

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
  const dateLocale = locale === "fr" ? fr : enUS;

  const certificates = await db.certificateIssued.findMany({
    where: { userId: session.user.id },
    include: { certification: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Link href="/dashboard" className="text-sm text-navy hover:underline">
          ← {t("title")}
        </Link>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-navy">
          {t("myCertificates")}
        </h1>

        {certificates.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="flex flex-col items-center pt-8 text-center">
                  <VerificationSeal
                    status={sealStatusFromCertificate(cert.status)}
                    code={cert.uniqueCode}
                    level={cert.certification.level}
                    size="md"
                  />
                  <p className="mt-6 font-display font-semibold text-navy">
                    {localizedField(cert.certification, "title", locale)}
                  </p>
                  <StatusBadge status={cert.status} label={ts(cert.status)} className="mt-2" />
                  <p className="mt-2 text-sm text-ink-muted">
                    {format(cert.issuedAt, "PP", { locale: dateLocale })}
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                    <Link href={`/verify/${cert.uniqueCode}`}>{t("viewCertificate")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-ink-muted">{t("noCertificates")}</p>
        )}
      </div>
    </div>
  );
}
