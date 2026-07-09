import { Link } from "@/i18n/routing";
import { Award } from "lucide-react";

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
    <footer className="mt-auto border-t border-navy/10 bg-navy text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              <p className="font-display font-semibold">{labels.appName}</p>
            </div>
            <p className="mt-3 text-sm text-white/70">{labels.tagline}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/courses" className="text-white/70 transition-colors hover:text-gold">
              {labels.courses}
            </Link>
            <Link href="/certifications" className="text-white/70 transition-colors hover:text-gold">
              {labels.certifications}
            </Link>
          </div>
          <div className="text-sm text-white/60">
            <p>&copy; {new Date().getFullYear()} PROIMMO Academy</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
