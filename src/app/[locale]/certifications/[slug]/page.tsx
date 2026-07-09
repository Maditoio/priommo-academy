import { db } from "@/lib/db";
import { localizedField } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Award } from "lucide-react";

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("certifications");
  const tc = await getTranslations("courses");

  const certification = await db.certification.findUnique({
    where: { slug },
    include: { course: true },
  });

  if (!certification) notFound();

  const title = localizedField(certification, "title", locale);
  const description = localizedField(certification, "description", locale);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="max-w-3xl">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <Badge variant="secondary" className="mb-4">
            {tc("level")}: {certification.level}
          </Badge>
          <h1 className="text-3xl font-bold lg:text-4xl">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>

          {certification.course && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-base">{t("linkedCourse")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/courses/${certification.course.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  {localizedField(certification.course, "title", locale)}
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="mt-8 border-dashed">
            <CardHeader>
              <CardTitle className="text-base">{t("requirements")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
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
