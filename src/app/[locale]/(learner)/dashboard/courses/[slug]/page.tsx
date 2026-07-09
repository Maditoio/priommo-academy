import { CourseDetailView } from "@/components/courses/course-detail-view";
import { setRequestLocale } from "next-intl/server";

export default async function LearnerCourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return <CourseDetailView locale={locale} slug={slug} variant="learner" />;
}
