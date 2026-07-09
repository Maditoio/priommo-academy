import { redirect } from "next/navigation";

export default async function RedirectNewCertification({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/certifications?modal=create`);
}
