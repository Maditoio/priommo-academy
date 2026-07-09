"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const nextLocale = locale === "fr" ? "en" : "fr";

  return (
    <Button
      variant={dark ? "ghost" : "ghostDark"}
      size="sm"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className={cn("gap-1.5", !dark && "text-navy")}
      aria-label="Switch language"
    >
      <Globe className="h-4 w-4" />
      {nextLocale.toUpperCase()}
    </Button>
  );
}
