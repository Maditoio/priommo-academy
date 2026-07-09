import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { enrollInCourse } from "@/actions/enrollment";
import { localizedField, formatPrice } from "@/lib/utils";
import { levelName } from "@/lib/levels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { VerificationSeal } from "@/components/public/verification-seal";
import { MaterialIcon } from "@/components/ui/material-icon";

interface CourseDetailViewProps {
  locale: string;
  slug: string;
  variant?: "public" | "learner";
}

export async function CourseDetailView({ locale, slug, variant = "public" }: CourseDetailViewProps) {
  const session = await auth();
  const t = await getTranslations("courses");
  const tcommon = await getTranslations("common");
  const td = await getTranslations("dashboard");

  const course = await db.course.findFirst({
    where: { slug, published: true },
    include: {
      level: true,
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      exams: true,
      certifications: { take: 1, include: { level: true } },
    },
  });

  if (!course) notFound();

  const title = localizedField(course, "title", locale);
  const description = localizedField(course, "description", locale);
  const price = parseFloat(course.price.toString());
  const isFree = price === 0;

  let enrollmentId: string | null = null;
  if (session?.user) {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    enrollmentId = enrollment?.id ?? null;
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const isLearner = variant === "learner";

  return (
    <div className={isLearner ? "space-y-6" : "py-12 lg:py-16"}>
      <div className={isLearner ? undefined : "mx-auto max-w-7xl px-6 lg:px-12"}>
        {isLearner && (
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/dashboard/courses">
              <MaterialIcon name="arrow_back" size={18} />
              {tcommon("back")}
            </Link>
          </Button>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative mb-6 aspect-[21/9] overflow-hidden rounded-xl bg-surface-hover">
              {course.imageUrl ? (
                <Image src={course.imageUrl} alt={title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <MaterialIcon name="menu_book" className="text-ink-muted/30" size={64} />
                </div>
              )}
            </div>
            <Badge variant="level" className="mb-4">
              {levelName(course.level, locale)}
            </Badge>
            <h1 className={isLearner ? "text-2xl font-semibold text-ink" : "text-3xl font-semibold text-ink lg:text-4xl"}>
              {title}
            </h1>
            <p className="mt-4 text-lg text-ink-muted">{description}</p>

            <Separator className="my-8" />

            <h2 id="curriculum" className="text-xl font-semibold text-ink">{t("curriculum")}</h2>
            <div className="mt-4 space-y-4">
              {course.modules.map((mod) => (
                <Card key={mod.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{localizedField(mod, "title", locale)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center gap-2 text-sm text-ink-muted">
                          <MaterialIcon name="menu_book" size={16} />
                          {localizedField(lesson, "title", locale)}
                          {lesson.durationMin && (
                            <span className="ml-auto flex items-center gap-1">
                              <MaterialIcon name="schedule" size={14} />
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
            <Card className={isLearner ? undefined : "sticky top-24"}>
              <CardContent className="p-6">
                {course.certifications[0] && (
                  <div className="mb-6 flex justify-center border-b border-border pb-6">
                    <VerificationSeal
                      status="valid"
                      code="PREVIEW"
                      level={levelName(course.certifications[0].level, locale)}
                      size="sm"
                    />
                  </div>
                )}
                <p className="text-3xl font-semibold text-ink">
                  {isFree ? tcommon("free") : formatPrice(price, course.currency, locale)}
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  {course.modules.length} {t("modules")} · {totalLessons} {t("lessons")}
                </p>
                {session?.user ? (
                  enrollmentId ? (
                    <Button asChild className="mt-6 w-full" size="lg">
                      <Link href={`/dashboard/enrollments/${enrollmentId}`}>
                        {td("continueLearning")}
                      </Link>
                    </Button>
                  ) : (
                    <div className="mt-6 space-y-2">
                      <Button asChild className="w-full" size="lg" variant="secondary">
                        <Link href="#curriculum">{t("viewCourse")}</Link>
                      </Button>
                      <form
                        action={async () => {
                          "use server";
                          await enrollInCourse(course.id, locale);
                        }}
                      >
                        <Button type="submit" className="w-full" size="lg">
                          {t("enroll")}
                        </Button>
                      </form>
                    </div>
                  )
                ) : (
                  <div className="mt-6 space-y-2">
                    <Button className="w-full" size="lg" variant="secondary" disabled>
                      {t("viewCourse")}
                    </Button>
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/login">{t("enroll")}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
