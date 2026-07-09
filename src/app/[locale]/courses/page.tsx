import { db } from "@/lib/db";
import { CourseCard } from "@/components/public/course-card";
import { CourseFilters } from "@/components/public/course-filters";
import { Pagination } from "@/components/admin/pagination";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

async function CourseList({
  locale,
  search,
  level,
  page,
  pageSize,
}: {
  locale: string;
  search?: string;
  level?: string;
  page: number;
  pageSize: number;
}) {
  const t = await getTranslations("courses");
  const tcommon = await getTranslations("common");
  const ta = await getTranslations("admin");

  const where = {
    published: true,
    ...(level && level !== "all" ? { level } : {}),
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
      include: { _count: { select: { modules: true } } },
    }),
    db.course.count({ where }),
  ]);

  return (
    <>
      {courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              locale={locale}
              enrollLabel={t("enroll")}
              levelLabel={t("level")}
              freeLabel={tcommon("free")}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">{t("noCourses")}</p>
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

export default async function CoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; level?: string; page?: string; pageSize?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("courses");
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 9);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-navy">{t("title")}</h1>
          <p className="mt-2 text-ink-muted">{t("subtitle")}</p>
        </div>

        <Suspense>
          <CourseFilters
            searchPlaceholder={t("searchPlaceholder")}
            allLevelsLabel={t("allLevels")}
            defaultSearch={sp.search}
            defaultLevel={sp.level}
          />
        </Suspense>

        <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
          <CourseList
            locale={locale}
            search={sp.search}
            level={sp.level}
            page={page}
            pageSize={pageSize}
          />
        </Suspense>
      </div>
    </div>
  );
}
