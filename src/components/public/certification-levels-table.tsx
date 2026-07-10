import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationSeal } from "@/components/public/verification-seal";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { CertificationCatalogRow } from "@/lib/certification-catalog";

interface CertificationLevelsTableProps {
  rows: CertificationCatalogRow[];
  labels: {
    certification: string;
    level: string;
    description: string;
    requirements: string;
    validity: string;
    learnMore: string;
  };
}

export function CertificationLevelsTable({ rows, labels }: CertificationLevelsTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-sm">
      {/* Desktop table */}
      <div className="hidden lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-hover/50 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <th className="px-6 py-4">{labels.certification}</th>
              <th className="px-4 py-4">{labels.level}</th>
              <th className="px-4 py-4">{labels.description}</th>
              <th className="px-4 py-4">{labels.requirements}</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((row) => (
              <tr key={row.slug} className="align-top transition-colors hover:bg-surface-hover/30">
                <td className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <VerificationSeal
                      status="valid"
                      code={row.slug.slice(0, 8).toUpperCase()}
                      level={row.levelLabel}
                      size="sm"
                    />
                    <div className="min-w-0 pt-1">
                      <p className="font-semibold text-ink">{row.title}</p>
                      <p className="mt-1 text-xs text-ink-muted">{row.validityLabel}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <Badge variant="level">{row.levelLabel}</Badge>
                </td>
                <td className="max-w-xs px-4 py-5 text-ink-muted">{row.description}</td>
                <td className="max-w-xs px-4 py-5 text-ink-muted">{row.requirements}</td>
                <td className="px-6 py-5">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/certifications/${row.slug}`}>
                      {labels.learnMore}
                      <MaterialIcon name="arrow_forward" size={16} />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border/50 lg:hidden">
        {rows.map((row) => (
          <article key={row.slug} className="space-y-4 p-5">
            <div className="flex items-start gap-4">
              <VerificationSeal
                status="valid"
                code={row.slug.slice(0, 8).toUpperCase()}
                level={row.levelLabel}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <Badge variant="level" className="mb-2">
                  {row.levelLabel}
                </Badge>
                <h3 className="font-semibold text-ink">{row.title}</h3>
                <p className="mt-1 text-xs text-ink-muted">{row.validityLabel}</p>
              </div>
            </div>
            <p className="text-sm text-ink-muted">{row.description}</p>
            <div className="rounded-xl bg-bg px-4 py-3 text-sm text-ink-muted">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink">{labels.requirements}</p>
              <p className="mt-1">{row.requirements}</p>
            </div>
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href={`/certifications/${row.slug}`}>
                {labels.learnMore}
                <MaterialIcon name="arrow_forward" size={16} />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
