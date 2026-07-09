import { CertificateVerifyResult } from "@/components/verify/certificate-verify-result";
import { setRequestLocale } from "next-intl/server";

export default async function LearnerVerifyResultPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);

  return <CertificateVerifyResult locale={locale} code={code} variant="learner" />;
}
