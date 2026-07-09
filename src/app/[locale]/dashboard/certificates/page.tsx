import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateCertificateQR } from "@/lib/qr";
import { localizedField } from "@/lib/utils";
import { StatusBadge } from "@/components/public/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import Image from "next/image";

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

  const certsWithQr = await Promise.all(
    certificates.map(async (cert) => ({
      ...cert,
      qrDataUrl: await generateCertificateQR(cert.uniqueCode),
    }))
  );

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          ← {t("title")}
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{t("myCertificates")}</h1>

        {certsWithQr.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certsWithQr.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="pt-6 text-center">
                  <Image
                    src={cert.qrDataUrl}
                    alt="QR"
                    width={160}
                    height={160}
                    className="mx-auto"
                  />
                  <p className="mt-4 font-medium">
                    {localizedField(cert.certification, "title", locale)}
                  </p>
                  <StatusBadge status={cert.status} label={ts(cert.status)} className="mt-2" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {format(cert.issuedAt, "PP", { locale: dateLocale })}
                  </p>
                  <Link
                    href={`/verify/${cert.uniqueCode}`}
                    className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    {t("viewCertificate")}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-muted-foreground">{t("noCertificates")}</p>
        )}
      </div>
    </div>
  );
}
