import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { NavLinks } from "@/components/public/nav-links";
import { MaterialIcon } from "@/components/ui/material-icon";

interface HeaderProps {
  locale: string;
  labels: {
    home: string;
    courses: string;
    certifications: string;
    verify: string;
    login: string;
    register: string;
    dashboard: string;
    admin: string;
    appName: string;
  };
}

export async function Header({ labels }: HeaderProps) {
  const session = await auth();

  const extraLinks = session?.user
    ? [
        { href: "/dashboard", label: labels.dashboard },
        ...(session.user.role === "ADMIN"
          ? [{ href: "/admin", label: labels.admin }]
          : []),
      ]
    : [
        { href: "/login", label: labels.login },
        { href: "/register", label: labels.register },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-surface shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft">
            <MaterialIcon name="workspace_premium" className="text-accent" size={22} />
          </div>
          <span className="hidden text-lg font-semibold text-ink sm:inline">{labels.appName}</span>
        </Link>

        <NavLinks
          courses={labels.courses}
          certifications={labels.certifications}
          verify={labels.verify}
          extraLinks={extraLinks}
        />

        <div className="shrink-0">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
