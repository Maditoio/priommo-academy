"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const nextLocale = locale === "fr" ? "en" : "fr";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className="gap-1.5 text-ink-muted"
      aria-label="Switch language"
    >
      <MaterialIcon name="language" size={18} />
      {nextLocale.toUpperCase()}
    </Button>
  );
}
