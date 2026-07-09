import { db } from "@/lib/db";
import { localizedField } from "@/lib/utils";
import { levelName } from "@/lib/levels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationSeal } from "@/components/public/verification-seal";
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

  const certification = await db.certification.findUnique({
    where: { slug },
    include: { course: true, level: true },
  });

  if (!certification) notFound();

  const title = localizedField(certification, "title", locale);
  const description = localizedField(certification, "description", locale);
  const level = levelName(certification.level, locale);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="max-w-3xl">
          <VerificationSeal
            status="valid"
            code={certification.slug.slice(0, 10).toUpperCase()}
            level={level}
            size="lg"
            className="mb-8"
          />
          <Badge variant="level" className="mb-4">
            {level}
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-navy">{title}</h1>
          <p className="mt-4 text-lg text-ink-muted">{description}</p>

          {certification.course && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-base">{t("linkedCourse")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/courses/${certification.course.slug}`}
                  className="font-medium text-navy hover:underline"
                >
                  {localizedField(certification.course, "title", locale)}
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="mt-8 border-dashed border-navy/20">
            <CardHeader>
              <CardTitle className="text-base">{t("requirements")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-muted">
                {locale === "fr"
                  ? "Réussir l'examen de la formation associée avec le score minimum requis."
                  : "Pass the linked course exam with the minimum required score."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
