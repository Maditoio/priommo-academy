import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("nav");
  const tc = await getTranslations("common");

  return (
    <>
      <Header
        locale={locale}
        labels={{
          home: t("home"),
          courses: t("courses"),
          certifications: t("certifications"),
          login: t("login"),
          register: t("register"),
          verify: t("verify"),
          appName: tc("appName"),
        }}
      />
      <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col">{children}</div>
      <Footer
        labels={{
          appName: tc("appName"),
          tagline: tc("tagline"),
          courses: t("courses"),
          certifications: t("certifications"),
          verify: t("verify"),
        }}
      />
    </>
  );
}
