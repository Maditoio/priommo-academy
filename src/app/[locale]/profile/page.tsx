import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/public/profile-form";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("profile");
  const ta = await getTranslations("auth");
  const tc = await getTranslations("common");

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, imageUrl: true },
  });

  return (
    <div className="px-6 py-12 lg:py-16">
      <ProfileForm
        locale={locale}
        user={user}
        labels={{
          title: t("title"),
          subtitle: t("subtitle"),
          name: ta("name"),
          email: ta("email"),
          phone: ta("phone"),
          imageUrl: t("imageUrl"),
          imageHint: t("imageHint"),
          save: tc("save"),
          certificateNote: t("certificateNote"),
        }}
      />
    </div>
  );
}
