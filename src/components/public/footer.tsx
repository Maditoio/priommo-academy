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
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:justify-between lg:px-12">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            <p className="font-semibold text-ink">{labels.appName}</p>
          </div>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">{labels.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/courses" className="text-ink-muted transition-colors hover:text-accent">
            {labels.courses}
          </Link>
          <Link href="/certifications" className="text-ink-muted transition-colors hover:text-accent">
            {labels.certifications}
          </Link>
          <Link href="/verify" className="text-ink-muted transition-colors hover:text-accent">
            {labels.verify}
          </Link>
        </div>
      </div>
    </footer>
  );
}
