"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  courses: string;
  certifications: string;
}

export function NavLinks({ courses, certifications }: NavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/courses", label: courses },
    { href: "/certifications", label: certifications },
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
              "relative py-1 text-sm font-medium text-white/80 transition-colors hover:text-white",
              isActive && "text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gold"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
