"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ExtraLink = { href: string; label: string };

interface NavLinksProps {
  courses: string;
  certifications: string;
  verify: string;
  extraLinks?: ExtraLink[];
}

export function NavLinks({ courses, certifications, verify, extraLinks = [] }: NavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/courses", label: courses },
    { href: "/certifications", label: certifications },
    { href: "/verify", label: verify },
    ...extraLinks,
  ];

  return (
    <nav className="flex flex-1 items-center justify-center gap-5 overflow-x-auto px-2 sm:gap-8">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const isAuth = link.href === "/login" || link.href === "/register" || link.href === "/dashboard" || link.href === "/admin";
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 py-1 text-sm font-medium transition-colors",
              isAuth
                ? "text-ink-muted hover:text-ink"
                : "text-ink-muted hover:text-ink",
              isActive && "text-accent"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
