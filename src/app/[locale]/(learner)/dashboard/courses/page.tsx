import { CoursesCatalog } from "@/components/courses/courses-catalog";
import { setRequestLocale } from "next-intl/server";

export default async function LearnerCoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; level?: string; page?: string; pageSize?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 9);

  return (
    <CoursesCatalog
      locale={locale}
      search={sp.search}
      level={sp.level}
      page={page}
      pageSize={pageSize}
      courseBasePath="/dashboard/courses"
      variant="learner"
    />
  );
}
