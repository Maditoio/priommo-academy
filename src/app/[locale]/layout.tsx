import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fr" | "en")) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
      <Header
        locale={locale}
        labels={{
          home: t("home"),
          courses: t("courses"),
          certifications: t("certifications"),
          login: t("login"),
          register: t("register"),
          dashboard: t("dashboard"),
          logout: t("logout"),
          admin: t("admin"),
          appName: tc("appName"),
        }}
      />
      <div className="flex-1">{children}</div>
      <Footer
        labels={{
          appName: tc("appName"),
          tagline: tc("tagline"),
          courses: t("courses"),
          certifications: t("certifications"),
          verify: t("verify"),
        }}
      />
      <Toaster position="top-right" richColors />
      </Providers>
    </NextIntlClientProvider>
  );
}
