import { auth } from "@/lib/auth";
import { CoursesCatalog } from "@/components/courses/courses-catalog";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

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

  const session = await auth();
  const query = new URLSearchParams();
  if (sp.search) query.set("search", sp.search);
  if (sp.level) query.set("level", sp.level);
  if (sp.page) query.set("page", sp.page);
  if (sp.pageSize) query.set("pageSize", sp.pageSize);
  const qs = query.toString();

  if (session?.user) {
    redirect(`/${locale}/dashboard/courses${qs ? `?${qs}` : ""}`);
  }

  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 9);

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <CoursesCatalog
          locale={locale}
          search={sp.search}
          level={sp.level}
          page={page}
          pageSize={pageSize}
          courseBasePath="/courses"
          variant="public"
        />
      </div>
    </div>
  );
}
