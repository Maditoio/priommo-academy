import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { addModule, addLesson } from "@/actions/courses";
import { addExamCategory } from "@/actions/exams";
import { AdminShell } from "@/components/admin/admin-shell";
import { CourseDetailAdmin } from "@/components/admin/course-detail-admin";
import { levelName } from "@/lib/levels";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function AdminCourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ exam?: string; tab?: string }>;
}) {
  const { locale, id } = await params;
  await searchParams;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const tc = await getTranslations("common");
  const te = await getTranslations("exam");

  const [course, levels] = await Promise.all([
    db.course.findUnique({
      where: { id },
      include: {
        level: true,
        modules: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } },
        },
        examCategories: true,
        exams: {
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: { choices: { orderBy: { order: "asc" } } },
            },
            categoryReqs: { include: { category: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    }),
    db.certificationLevel.findMany({ orderBy: { rank: "asc" } }),
  ]);

  if (!course) notFound();

  async function addModuleAction(formData: FormData) {
    "use server";
    await addModule(course!.id, formData, locale);
  }

  async function addLessonFromForm(formData: FormData) {
    "use server";
    const moduleId = String(formData.get("moduleId") ?? "");
    if (!moduleId) return;
    await addLesson(moduleId, course!.id, formData, locale);
  }

  async function addCategoryAction(formData: FormData) {
    "use server";
    await addExamCategory(course!.id, formData, locale);
  }

  const shellLabels = {
    title: ta("title"),
    overview: ta("overview"),
    courses: ta("courses"),
    certifications: ta("certifications"),
    enrollments: ta("enrollments"),
    certificates: ta("certificates"),
    users: ta("users"),
    organizations: ta("organizations"),
    payments: ta("payments"),
    levels: te("levels"),
  };

  const detailLabels = {
    ...shellLabels,
    back: ta("courses"),
    edit: tc("edit"),
    preview: te("previewCourse"),
    published: tc("published"),
    draft: tc("draft"),
    modules: ta("modules"),
    lessons: ta("lessons"),
    exams: te("exams"),
    questions: te("questions"),
    tabCurriculum: te("tabCurriculum"),
    tabCategories: te("categories"),
    tabExams: te("exams"),
    addModule: ta("addModule"),
    addLesson: ta("addLesson"),
    addCategory: te("addCategory"),
    titleFr: ta("titleFr"),
    titleEn: ta("titleEn"),
    slug: ta("slug"),
    nameFr: te("nameFr"),
    nameEn: te("nameEn"),
    noModules: te("noModules"),
    noCategories: te("noCategories"),
    moduleOrder: te("moduleOrder"),
    lessonOrder: te("lessonOrder"),
    duration: te("duration"),
    categoriesSubtitle: te("categoriesSubtitle"),
    curriculumSubtitle: te("curriculumSubtitle"),
    examsSubtitle: te("examsSubtitle"),
    examLabels: {
      exams: te("exams"),
      officialExams: te("officialExams"),
      practiceExams: te("practiceExams"),
      titleFr: ta("titleFr"),
      titleEn: ta("titleEn"),
      passingScore: te("passingScore"),
      duration: te("duration"),
      maxAttempts: te("maxAttempts"),
      questionCount: te("questionCount"),
      allQuestions: te("allQuestions"),
      practiceExam: te("practiceExam"),
      practice: te("practice"),
      save: tc("save"),
      categoryRequirements: te("categoryRequirements"),
      questions: te("questions"),
      addQuestion: te("addQuestion"),
      addExam: te("addExam"),
      level: ta("level"),
      category: te("category"),
      promptFr: te("promptFr"),
      promptEn: te("promptEn"),
      choices: te("choices"),
      correctAnswer: te("correctAnswer"),
    },
  };

  const courseData = {
    id: course.id,
    slug: course.slug,
    titleFr: course.titleFr,
    titleEn: course.titleEn,
    descriptionFr: course.descriptionFr,
    published: course.published,
    levelLabel: levelName(course.level, locale),
    priceLabel: formatPrice(course.price.toString(), course.currency, locale),
    enrollmentCount: course._count.enrollments,
    modules: course.modules,
    examCategories: course.examCategories,
    exams: course.exams,
  };

  return (
    <AdminShell labels={shellLabels} currentPath="/admin/courses">
      <Suspense fallback={<div className="py-12 text-ink-muted">Loading…</div>}>
        <CourseDetailAdmin
          locale={locale}
          course={courseData}
          levels={levels}
          labels={detailLabels}
          onAddModule={addModuleAction}
          onAddLesson={addLessonFromForm}
          onAddCategory={addCategoryAction}
        />
      </Suspense>
    </AdminShell>
  );
}
