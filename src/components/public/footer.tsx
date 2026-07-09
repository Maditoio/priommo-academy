import { Link } from "@/i18n/routing";

interface FooterProps {
  labels: {
    appName: string;
    tagline: string;
    courses: string;
    certifications: string;
    verify: string;
  };
}

export function Footer({ labels }: FooterProps) {
  return (
    <footer className="mt-auto border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-semibold text-primary">{labels.appName}</p>
            <p className="mt-2 text-sm text-muted-foreground">{labels.tagline}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/courses" className="text-muted-foreground hover:text-foreground">
              {labels.courses}
            </Link>
            <Link href="/certifications" className="text-muted-foreground hover:text-foreground">
              {labels.certifications}
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PROIMMO Academy. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
