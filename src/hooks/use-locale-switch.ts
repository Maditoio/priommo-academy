"use client";

import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

export const SUPPORTED_LOCALES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
] as const;

export function useLocaleSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  function switchTo(nextLocale: string) {
    if (nextLocale === locale) return;
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`${pathname}${search}`, { locale: nextLocale });
  }

  return { locale, switchTo, locales: SUPPORTED_LOCALES };
}
