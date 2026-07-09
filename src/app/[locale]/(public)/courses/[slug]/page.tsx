import { auth } from "@/lib/auth";
import { CourseDetailView } from "@/components/courses/course-detail-view";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user) {
    redirect(`/${locale}/dashboard/courses/${slug}`);
  }

  return <CourseDetailView locale={locale} slug={slug} variant="public" />;
}
