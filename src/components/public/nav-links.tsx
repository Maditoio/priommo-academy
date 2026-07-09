"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  courses: string;
  certifications: string;
  verify: string;
}

export function NavLinks({ courses, certifications, verify }: NavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/courses", label: courses },
    { href: "/certifications", label: certifications },
    { href: "/verify", label: verify },
  ];

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative py-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink",
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
