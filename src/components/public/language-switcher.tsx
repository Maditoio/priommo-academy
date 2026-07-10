"use client";

import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, switchTo, locales } = useLocaleSwitch();
  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-muted outline-none transition-colors duration-150 hover:bg-surface-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/25 data-[state=open]:bg-surface-hover data-[state=open]:text-ink",
          className
        )}
        aria-label="Switch language"
      >
        <MaterialIcon name="language" size={18} />
        <span className="uppercase tracking-wide">{current.code}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {locales.map((l) => (
          <DropdownMenuItem key={l.code} onSelect={() => switchTo(l.code)}>
            <span className="flex-1">{l.label}</span>
            {l.code === locale && <MaterialIcon name="check" size={16} className="text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
