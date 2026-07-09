import { LessonViewer } from "@/components/learner/lesson-viewer";
import { auth } from "@/lib/auth";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; lessonId: string }>;
}) {
  const { locale, id, lessonId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  return <LessonViewer locale={locale} enrollmentId={id} lessonId={lessonId} />;
}
