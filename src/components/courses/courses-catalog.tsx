import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CourseCard } from "@/components/public/course-card";
import { CourseFilters } from "@/components/public/course-filters";
import { Pagination } from "@/components/admin/pagination";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

async function CourseList({
  locale,
  search,
  levelSlug,
  page,
  pageSize,
  courseBasePath,
}: {
  locale: string;
  search?: string;
  levelSlug?: string;
  page: number;
  pageSize: number;
  courseBasePath: string;
}) {
  const t = await getTranslations("courses");
  const tcommon = await getTranslations("common");
  const td = await getTranslations("dashboard");
  const ta = await getTranslations("admin");

  const session = await auth();

  const levelRecord =
    levelSlug && levelSlug !== "all"
      ? await db.certificationLevel.findUnique({ where: { slug: levelSlug } })
      : null;

  const where = {
    published: true,
    ...(levelRecord ? { levelId: levelRecord.id } : {}),
    ...(search
      ? {
          OR: [
            { titleFr: { contains: search, mode: "insensitive" as const } },
            { titleEn: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { level: true, _count: { select: { modules: true } } },
    }),
    db.course.count({ where }),
  ]);

  const enrollmentMap = session?.user
    ? Object.fromEntries(
        (
          await db.enrollment.findMany({
            where: { userId: session.user.id, courseId: { in: courses.map((c) => c.id) } },
            select: { id: true, courseId: true },
          })
        ).map((e) => [e.courseId, e.id])
      )
    : {};

  return (
    <>
      {courses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              locale={locale}
              viewLabel={t("viewCourse")}
              enrollLabel={t("enroll")}
              continueLabel={td("continueLearning")}
              levelLabel={t("level")}
              freeLabel={tcommon("free")}
              courseBasePath={courseBasePath}
              enrollmentId={enrollmentMap[course.id] ?? null}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-ink-muted">{t("noCourses")}</p>
      )}
      <div className="mt-8">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          showingLabel={ta("showing")}
          pageSizeLabel={ta("pageSize")}
        />
      </div>
    </>
  );
}

interface CoursesCatalogProps {
  locale: string;
  search?: string;
  level?: string;
  page: number;
  pageSize: number;
  courseBasePath: string;
  variant?: "public" | "learner";
}

export async function CoursesCatalog({
  locale,
  search,
  level,
  page,
  pageSize,
  courseBasePath,
  variant = "public",
}: CoursesCatalogProps) {
  const t = await getTranslations("courses");
  const levels = await db.certificationLevel.findMany({ orderBy: { rank: "asc" } });

  const header =
    variant === "learner" ? (
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>
    ) : (
      <div className="mb-8">
        <h1 className="text-[1.875rem] font-semibold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("subtitle")}</p>
      </div>
    );

  return (
    <>
      {header}
      <Suspense>
        <CourseFilters
          searchPlaceholder={t("searchPlaceholder")}
          allLevelsLabel={t("allLevels")}
          levels={levels}
          locale={locale}
          defaultSearch={search}
          defaultLevel={level}
        />
      </Suspense>
      <Suspense fallback={<p className="text-ink-muted">{t("noCourses")}</p>}>
        <CourseList
          locale={locale}
          search={search}
          levelSlug={level}
          page={page}
          pageSize={pageSize}
          courseBasePath={courseBasePath}
        />
      </Suspense>
    </>
  );
}
