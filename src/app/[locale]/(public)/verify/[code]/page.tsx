import { auth } from "@/lib/auth";
import { CertificateVerifyResult } from "@/components/verify/certificate-verify-result";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user) {
    redirect(`/${locale}/dashboard/verify/${code}`);
  }

  return <CertificateVerifyResult locale={locale} code={code} variant="public" />;
}
