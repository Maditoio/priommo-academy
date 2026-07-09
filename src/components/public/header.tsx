import { Link } from "@/i18n/routing";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { NavLinks } from "@/components/public/nav-links";
import { MaterialIcon } from "@/components/ui/material-icon";
import Image from "next/image";

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
    profile: string;
    appName: string;
  };
}

export async function Header({ locale, labels }: HeaderProps) {
  const session = await auth();
  const profile =
    session?.user?.id
      ? await db.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, imageUrl: true },
        })
      : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-surface shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft">
            <MaterialIcon name="workspace_premium" className="text-accent" size={22} />
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
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/profile">
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent-soft">
                    {profile?.imageUrl ? (
                      <Image
                        src={profile.imageUrl}
                        alt={profile.name}
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MaterialIcon name="person" className="text-accent" size={16} />
                    )}
                  </span>
                  <span className="hidden sm:inline">{labels.profile}</span>
                </Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: `/${locale}` });
                }}
              >
                <Button type="submit" variant="secondary" size="sm">
                  <MaterialIcon name="logout" size={18} />
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
