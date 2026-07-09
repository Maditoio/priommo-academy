import { Link } from "@/i18n/routing";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { NavLinks } from "@/components/public/nav-links";
import { Award } from "lucide-react";

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
    logout: string;
    admin: string;
    appName: string;
  };
}

export async function Header({ locale, labels }: HeaderProps) {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-surface shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft">
            <Award className="h-5 w-5 text-accent" />
          </div>
          <span className="hidden text-lg font-semibold text-ink sm:inline">{labels.appName}</span>
        </Link>

        <NavLinks
          courses={labels.courses}
          certifications={labels.certifications}
          verify={labels.verify}
        />

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">{labels.admin}</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">{labels.dashboard}</Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: `/${locale}` });
                }}
              >
                <Button type="submit" variant="secondary" size="sm">
                  {labels.logout}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{labels.login}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{labels.register}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
