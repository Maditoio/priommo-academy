import { VerifySearchForm } from "@/components/public/verify-search-form";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function LearnerVerifyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("verify");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {locale === "fr"
            ? "Vérifiez l'authenticité d'un certificat PROIMMO Academy."
            : "Verify the authenticity of a PROIMMO Academy certificate."}
        </p>
      </div>
      <VerifySearchForm
        verifyBasePath="/dashboard/verify"
        compact
        labels={{
          title: t("title"),
          subtitle:
            locale === "fr"
              ? "Entrez le code unique figurant sur le certificat."
              : "Enter the unique code printed on the certificate.",
          placeholder: locale === "fr" ? "Code du certificat" : "Certificate code",
          submit: locale === "fr" ? "Vérifier" : "Verify",
        }}
      />
    </div>
  );
}
