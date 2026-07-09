import { Link } from "@/i18n/routing";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { GraduationCap } from "lucide-react";

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
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <GraduationCap className="h-7 w-7" />
          <span className="hidden sm:inline">{labels.appName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {labels.courses}
          </Link>
          <Link
            href="/certifications"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {labels.certifications}
          </Link>
        </nav>

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
                <Button type="submit" variant="outline" size="sm">
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
