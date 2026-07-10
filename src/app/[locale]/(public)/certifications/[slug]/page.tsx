import { db } from "@/lib/db";
import { localizedField } from "@/lib/utils";
import { levelName } from "@/lib/levels";
import { toCertificationCatalogRow } from "@/lib/certification-catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationSeal } from "@/components/public/verification-seal";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("certifications");
  const tnav = await getTranslations("nav");

  const certification = await db.certification.findUnique({
    where: { slug },
    include: {
      course: {
        include: {
          exams: { select: { passingScore: true, isPractice: true, durationMin: true } },
        },
      },
      level: true,
    },
  });

  if (!certification) notFound();

  const title = localizedField(certification, "title", locale);
  const description = localizedField(certification, "description", locale);
  const level = levelName(certification.level, locale);
  const row = toCertificationCatalogRow(certification, locale, {
    validityMonths: t("validityMonths"),
    passOfficialExam: t("passOfficialExam"),
    completePrepProgram: t("linkedCourse"),
    prerequisitePro: t("prerequisitePro"),
    programInDevelopment: t("programInDevelopment"),
  });
  const officialExam = certification.course?.exams.find((e) => !e.isPractice);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href="/certifications">
            <MaterialIcon name="arrow_back" size={18} />
            {t("title")}
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="level">{level}</Badge>
              <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                {row.validityLabel}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">{description}</p>

            <Card className="mt-8 border-border/70 shadow-sm">
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {t("requirements")}
                  </p>
                  <p className="mt-2 text-ink">{row.requirements}</p>
                </div>
                {officialExam && (
                  <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-ink-muted">
                        {locale === "fr" ? "Score minimum" : "Minimum score"}
                      </p>
                      <p className="mt-1 font-semibold text-ink">{officialExam.passingScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted">
                        {locale === "fr" ? "Durée de l'examen" : "Exam duration"}
                      </p>
                      <p className="mt-1 font-semibold text-ink">{officialExam.durationMin} min</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {certification.course && (
              <Card className="mt-6 border-dashed border-accent/25 bg-accent-soft/20 shadow-sm">
                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{t("linkedCourse")}</p>
                    <p className="mt-1 text-ink-muted">
                      {localizedField(certification.course, "title", locale)}
                    </p>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href={`/courses/${certification.course.slug}`}>
                      {locale === "fr" ? "Accéder au programme" : "Access program"}
                      <MaterialIcon name="arrow_forward" size={18} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="lg:sticky lg:top-8">
            <Card className="overflow-hidden border-border/70 shadow-lg">
              <CardContent className="flex flex-col items-center px-6 py-8 text-center">
                <VerificationSeal
                  status="valid"
                  code={certification.slug.slice(0, 10).toUpperCase()}
                  level={level}
                  size="lg"
                />
                <p className="mt-6 text-sm text-ink-muted">
                  {locale === "fr"
                    ? "Certification officielle PROIMMO Academy"
                    : "Official PROIMMO Academy certification"}
                </p>
                <Button asChild className="mt-6 w-full" size="lg">
                  <Link href="/register">{tnav("register")}</Link>
                </Button>
                <Button asChild variant="secondary" className="mt-2 w-full">
                  <Link href="/verify">{tnav("verify")}</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
