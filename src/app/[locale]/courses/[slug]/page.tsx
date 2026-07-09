import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { enrollInCourse } from "@/actions/enrollment";
import { localizedField, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { VerificationSeal } from "@/components/public/verification-seal";
import { BookOpen, Clock } from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const t = await getTranslations("courses");
  const tcommon = await getTranslations("common");

  const course = await db.course.findFirst({
    where: { slug, published: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      exams: true,
      certifications: { take: 1 },
    },
  });

  if (!course) notFound();

  const title = localizedField(course, "title", locale);
  const description = localizedField(course, "description", locale);
  const price = parseFloat(course.price.toString());
  const isFree = price === 0;

  let isEnrolled = false;
  if (session?.user) {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    isEnrolled = !!enrollment;
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative mb-6 aspect-[21/9] overflow-hidden rounded-[12px] border border-navy/10 bg-navy/5">
              {course.imageUrl ? (
                <Image src={course.imageUrl} alt={title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-16 w-16 text-navy/20" />
                </div>
              )}
            </div>
            <Badge variant="level" className="mb-4">
              {course.level}
            </Badge>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-navy lg:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-lg text-ink-muted">{description}</p>

            <Separator className="my-8" />

            <h2 className="font-display text-xl font-semibold text-navy">{t("curriculum")}</h2>
            <div className="mt-4 space-y-4">
              {course.modules.map((mod) => (
                <Card key={mod.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {localizedField(mod, "title", locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center gap-2 text-sm text-ink-muted">
                          <BookOpen className="h-4 w-4 shrink-0" />
                          {localizedField(lesson, "title", locale)}
                          {lesson.durationMin && (
                            <span className="ml-auto flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.durationMin} min
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {course.certifications[0] && (
                  <div className="mb-6 flex justify-center border-b border-navy/10 pb-6">
                    <VerificationSeal
                      status="valid"
                      code="PREVIEW"
                      level={course.certifications[0].level}
                      size="sm"
                    />
                  </div>
                )}
                <p className="font-display text-3xl font-semibold text-navy">
                  {isFree ? tcommon("free") : formatPrice(price, course.currency, locale)}
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  {course.modules.length} {t("modules")} · {totalLessons} {t("lessons")}
                </p>
                {session?.user ? (
                  isEnrolled ? (
                    <Button className="mt-6 w-full" variant="secondary" disabled>
                      {t("enrolled")}
                    </Button>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await enrollInCourse(course.id, locale);
                      }}
                    >
                      <Button type="submit" className="mt-6 w-full" size="lg">
                        {t("enroll")}
                      </Button>
                    </form>
                  )
                ) : (
                  <Button className="mt-6 w-full" size="lg" asChild>
                    <a href={`/${locale}/login`}>{t("enroll")}</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
