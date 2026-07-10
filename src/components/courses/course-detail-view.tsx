import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { enrollInCourse } from "@/actions/enrollment";
import { localizedField, formatPrice } from "@/lib/utils";
import { levelName } from "@/lib/levels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function lessonIcon(contentType: string) {
  if (contentType === "video") return "play_circle";
  if (contentType === "pdf") return "picture_as_pdf";
  return "article";
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
  const totalDuration = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((sum, l) => sum + (l.durationMin ?? 0), 0),
    0
  );
  const isLearner = variant === "learner";

  return (
    <div className={isLearner ? "space-y-0" : "py-8 lg:py-12"}>
      <div className={isLearner ? undefined : "mx-auto max-w-7xl px-6 lg:px-12"}>
        {isLearner && (
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link href="/dashboard/courses">
              <MaterialIcon name="arrow_back" size={18} />
              {tcommon("back")}
            </Link>
          </Button>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-ink shadow-xl">
          <div className="relative aspect-[21/9] min-h-[220px] w-full">
            {course.imageUrl ? (
              <Image src={course.imageUrl} alt={title} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/20 to-ink">
                <MaterialIcon name="menu_book" className="text-white/20" size={80} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="level" className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                  {levelName(course.level, locale)}
                </Badge>
                {course.certifications[0] && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    <MaterialIcon name="workspace_premium" size={14} />
                    {locale === "fr" ? "Certification incluse" : "Certification included"}
                  </span>
                )}
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">{description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 bg-ink/95 sm:grid-cols-4">
            <HeroStat icon="view_module" label={t("modules")} value={String(course.modules.length)} />
            <HeroStat icon="menu_book" label={t("lessons")} value={String(totalLessons)} />
            <HeroStat
              icon="schedule"
              label={locale === "fr" ? "Durée totale" : "Total duration"}
              value={totalDuration > 0 ? `${totalDuration} min` : "—"}
            />
            <HeroStat icon="quiz" label={locale === "fr" ? "Examens" : "Exams"} value={String(course.exams.length)} />
          </div>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Curriculum */}
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {locale === "fr" ? "Programme" : "Program"}
                </p>
                <h2 id="curriculum" className="mt-1 text-2xl font-semibold text-ink">
                  {t("curriculum")}
                </h2>
              </div>
              <p className="text-sm text-ink-muted">
                {course.modules.length} {t("modules")} · {totalLessons} {t("lessons")}
              </p>
            </div>

            <div className="space-y-4">
              {course.modules.map((mod, moduleIndex) => (
                <Card key={mod.id} className="overflow-hidden border-border/70 shadow-sm">
                  <div className="flex items-center gap-4 border-b border-border/60 bg-surface-hover/40 px-5 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-sm font-bold text-accent">
                      {String(moduleIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-ink">{localizedField(mod, "title", locale)}</h3>
                      <p className="text-sm text-ink-muted">
                        {mod.lessons.length} {t("lessons")}
                        {mod.lessons.some((l) => l.durationMin) && (
                          <>
                            {" "}
                            ·{" "}
                            {mod.lessons.reduce((sum, l) => sum + (l.durationMin ?? 0), 0)} min
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/50">
                      {mod.lessons.map((lesson, lessonIndex) => (
                        <li
                          key={lesson.id}
                          className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-hover/30"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-bg text-xs font-medium text-ink-muted">
                            {lessonIndex + 1}
                          </span>
                          <MaterialIcon
                            name={lessonIcon(lesson.contentType)}
                            size={20}
                            className="shrink-0 text-accent"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-ink">{localizedField(lesson, "title", locale)}</p>
                            {localizedField(lesson, "body", locale) && (
                              <p className="mt-0.5 line-clamp-1 text-sm text-ink-muted">
                                {localizedField(lesson, "body", locale)}
                              </p>
                            )}
                          </div>
                          {lesson.durationMin != null && lesson.durationMin > 0 && (
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-xs font-medium text-ink-muted">
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
          </section>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8">
            <Card className="overflow-hidden border-border/70 shadow-lg">
              {course.certifications[0] && (
                <div className="flex justify-center border-b border-border/60 bg-accent-soft/20 px-6 py-8">
                  <VerificationSeal
                    status="valid"
                    code="PREVIEW"
                    level={levelName(course.certifications[0].level, locale)}
                    size="sm"
                  />
                </div>
              )}
              <CardContent className="space-y-5 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                    {locale === "fr" ? "Tarif" : "Pricing"}
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">
                    {isFree ? tcommon("free") : formatPrice(price, course.currency, locale)}
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-ink-muted">
                  <li className="flex items-center gap-2.5">
                    <MaterialIcon name="check_circle" size={18} className="text-accent" />
                    {course.modules.length} {t("modules")}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <MaterialIcon name="check_circle" size={18} className="text-accent" />
                    {totalLessons} {t("lessons")}
                  </li>
                  {totalDuration > 0 && (
                    <li className="flex items-center gap-2.5">
                      <MaterialIcon name="check_circle" size={18} className="text-accent" />
                      {totalDuration} min {locale === "fr" ? "de contenu" : "of content"}
                    </li>
                  )}
                  {course.exams.length > 0 && (
                    <li className="flex items-center gap-2.5">
                      <MaterialIcon name="check_circle" size={18} className="text-accent" />
                      {course.exams.length} {locale === "fr" ? "examens" : "exams"}
                    </li>
                  )}
                </ul>

                {session?.user ? (
                  enrollmentId ? (
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/dashboard/enrollments/${enrollmentId}`}>
                        <MaterialIcon name="play_arrow" size={20} />
                        {td("continueLearning")}
                      </Link>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full" size="lg" variant="secondary">
                        <Link href="#curriculum">
                          <MaterialIcon name="list_alt" size={20} />
                          {t("viewCourse")}
                        </Link>
                      </Button>
                      <form
                        action={async () => {
                          "use server";
                          await enrollInCourse(course.id, locale);
                        }}
                      >
                        <Button type="submit" className="w-full" size="lg">
                          <MaterialIcon name="how_to_reg" size={20} />
                          {t("enroll")}
                        </Button>
                      </form>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
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
          </aside>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-1.5 text-xs text-white/60">
        <MaterialIcon name={icon} size={14} />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
