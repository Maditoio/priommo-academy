import { auth } from "@/lib/auth";
import { VerifySearchForm } from "@/components/public/verify-search-form";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function VerifySearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user) {
    redirect(`/${locale}/dashboard/verify`);
  }

  const t = await getTranslations("verify");

  return (
    <VerifySearchForm
      labels={{
        title: t("title"),
        subtitle:
          locale === "fr"
            ? "Entrez le code unique figurant sur le certificat pour vérifier son authenticité, sa date de délivrance et son expiration."
            : "Enter the unique code on the certificate to verify authenticity, issue date, and expiration.",
        placeholder: locale === "fr" ? "Code du certificat" : "Certificate code",
        submit: locale === "fr" ? "Vérifier" : "Verify",
      }}
    />
  );
}
