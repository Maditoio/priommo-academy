import { redirect } from "next/navigation";

export default async function RedirectEditCourse({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/admin/courses?modal=edit&id=${id}`);
}
