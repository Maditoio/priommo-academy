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
    <header className="sticky top-0 z-50 bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-navy-light">
            <Award className="h-5 w-5 text-gold" />
          </div>
          <span className="font-display hidden text-lg font-semibold tracking-tight sm:inline">
            {labels.appName}
          </span>
        </Link>

        <NavLinks courses={labels.courses} certifications={labels.certifications} />

        <div className="flex items-center gap-2">
          <LanguageSwitcher dark />
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
                <Button type="submit" variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                  {labels.logout}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{labels.login}</Link>
              </Button>
              <Button asChild variant="gold" size="sm">
                <Link href="/register">{labels.register}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
