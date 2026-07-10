import { db } from "@/lib/db";
import { markLessonComplete } from "@/actions/lessons";
import { getCompletedLessonIds } from "@/lib/lesson-progress";
import { localizedField } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

interface LessonViewerProps {
  locale: string;
  enrollmentId: string;
  lessonId: string;
}

export async function LessonViewer({ locale, enrollmentId, lessonId }: LessonViewerProps) {
  const t = await getTranslations("courses");
  const td = await getTranslations("dashboard");
  const tcommon = await getTranslations("common");

  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (!enrollment) notFound();

  const flatLessons = enrollment.course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitleFr: m.titleFr, moduleTitleEn: m.titleEn }))
  );
  const lesson = flatLessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const completedIds = await getCompletedLessonIds(enrollmentId);
  const isComplete = completedIds.has(lessonId);
  const currentIndex = flatLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = flatLessons[currentIndex - 1];
  const nextLesson = flatLessons[currentIndex + 1];
  const body = localizedField(lesson, "body", locale) || localizedField(lesson, "title", locale);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={`/dashboard/enrollments/${enrollmentId}`}>
            <MaterialIcon name="arrow_back" size={18} />
            {tcommon("back")}
          </Link>
        </Button>
        <span className="text-sm text-ink-muted">
          {t("lesson")} {currentIndex + 1} / {flatLessons.length}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              {locale === "fr" ? lesson.moduleTitleFr : lesson.moduleTitleEn}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">
              {localizedField(lesson, "title", locale)}
            </h1>
            {lesson.durationMin && (
              <p className="mt-2 flex items-center gap-1 text-sm text-ink-muted">
                <MaterialIcon name="schedule" size={16} />
                {lesson.durationMin} min
              </p>
            )}
          </div>

          <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-0">
              {lesson.contentType === "video" && lesson.contentUrl ? (
                <div className="aspect-video bg-ink">
                  <iframe
                    src={lesson.contentUrl}
                    title={localizedField(lesson, "title", locale)}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              ) : lesson.contentType === "pdf" && lesson.contentUrl ? (
                <div className="border-b border-border bg-surface-hover/40 px-6 py-4">
                  <a
                    href={lesson.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                  >
                    <MaterialIcon name="picture_as_pdf" size={18} />
                    {locale === "fr" ? "Ouvrir le document PDF" : "Open PDF document"}
                  </a>
                </div>
              ) : null}
              <div className="px-6 py-6">
                <div className="prose prose-zinc max-w-none whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink">
                  {body}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {prevLesson ? (
              <Button asChild variant="secondary">
                <Link href={`/dashboard/enrollments/${enrollmentId}/lessons/${prevLesson.id}`}>
                  <MaterialIcon name="chevron_left" size={18} />
                  {t("previousLesson")}
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {!isComplete ? (
              <form action={markLessonComplete.bind(null, lessonId, enrollmentId, locale)}>
                <Button type="submit" size="lg">
                  <MaterialIcon name="check_circle" size={18} />
                  {td("markComplete")}
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <MaterialIcon name="check_circle" size={18} />
                {td("lessonComplete")}
              </div>
            )}
            {nextLesson && isComplete ? (
              <Button asChild>
                <Link href={`/dashboard/enrollments/${enrollmentId}/lessons/${nextLesson.id}`}>
                  {t("nextLesson")}
                  <MaterialIcon name="chevron_right" size={18} />
                </Link>
              </Button>
            ) : (
              <span />
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="shadow-sm">
            <CardContent className="space-y-1 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {t("curriculum")}
              </p>
              {enrollment.course.modules.map((mod) => (
                <div key={mod.id} className="space-y-0.5">
                  <p className="px-2 py-1.5 text-xs font-semibold text-ink">
                    {localizedField(mod, "title", locale)}
                  </p>
                  {mod.lessons.map((l) => {
                    const done = completedIds.has(l.id);
                    const active = l.id === lessonId;
                    return (
                      <Link
                        key={l.id}
                        href={`/dashboard/enrollments/${enrollmentId}/lessons/${l.id}`}
                        className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                          active
                            ? "bg-accent-soft font-medium text-accent"
                            : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                        }`}
                      >
                        <MaterialIcon
                          name={done ? "check_circle" : active ? "play_circle" : "radio_button_unchecked"}
                          size={18}
                          className={done ? "text-success" : active ? "text-accent" : undefined}
                        />
                        <span className="line-clamp-2">{localizedField(l, "title", locale)}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
