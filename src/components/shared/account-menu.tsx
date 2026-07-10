"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { useRouter } from "@/i18n/routing";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface AccountMenuLink {
  href: string;
  label: string;
  icon: string;
}

interface AccountMenuProps {
  user: { name: string; email?: string | null; imageUrl: string | null };
  roleLabel: string;
  locale: string;
  links?: AccountMenuLink[];
  labels: {
    language: string;
    logout: string;
  };
  collapsed?: boolean;
  side?: "top" | "right";
}

export function AccountMenu({
  user,
  roleLabel,
  locale,
  links = [],
  labels,
  collapsed = false,
  side = "top",
}: AccountMenuProps) {
  const router = useRouter();
  const { switchTo, locales } = useLocaleSwitch();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function navigateAfterClose(href: string) {
    setOpen(false);
    startTransition(() => {
      router.push(href);
    });
  }

  function switchLocaleAfterClose(nextLocale: string) {
    setOpen(false);
    startTransition(() => {
      switchTo(nextLocale);
    });
  }

  function logoutAfterClose() {
    setOpen(false);
    signOut({ callbackUrl: `/${locale}` });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl p-2 text-left outline-none transition-colors duration-150 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent/25 data-[state=open]:bg-surface-hover",
          collapsed && "justify-center"
        )}
        aria-label="Account menu"
      >
        <UserAvatar src={user.imageUrl} name={user.name} size={38} className="shrink-0" />
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{roleLabel}</p>
            </div>
            <MaterialIcon
              name="unfold_more"
              size={18}
              className="shrink-0 text-ink-muted/60 transition-colors group-hover:text-ink-muted"
            />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={side === "top" ? "start" : "end"} className="w-[16rem]">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <UserAvatar src={user.imageUrl} name={user.name} size={36} className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            {user.email && <p className="truncate text-xs text-ink-muted">{user.email}</p>}
          </div>
        </div>

        {links.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {links.map((link) => (
              <DropdownMenuItem
                key={link.href}
                onSelect={(e) => {
                  e.preventDefault();
                  navigateAfterClose(link.href);
                }}
              >
                <MaterialIcon name={link.icon} size={18} className="shrink-0" />
                {link.label}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{labels.language}</DropdownMenuLabel>
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={(e) => {
              e.preventDefault();
              switchLocaleAfterClose(l.code);
            }}
          >
            <span className="flex-1">{l.label}</span>
            {l.code === locale && <MaterialIcon name="check" size={16} className="text-accent" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon="logout"
          destructive
          onSelect={(e) => {
            e.preventDefault();
            logoutAfterClose();
          }}
        >
          {labels.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
