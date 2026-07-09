import { redirect } from "next/navigation";

export default async function RedirectNewCourse({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/courses?modal=create`);
}
