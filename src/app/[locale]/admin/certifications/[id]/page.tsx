import { redirect } from "next/navigation";

export default async function RedirectEditCertification({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/admin/certifications?modal=edit&id=${id}`);
}
