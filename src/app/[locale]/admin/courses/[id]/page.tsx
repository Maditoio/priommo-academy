import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { addModule, addLesson } from "@/actions/courses";
import { addExamCategory } from "@/actions/exams";
import { AdminShell } from "@/components/admin/admin-shell";
import { ExamBuilder } from "@/components/admin/exam-builder";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Link } from "@/i18n/routing";
import { levelName } from "@/lib/levels";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function AdminCourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ exam?: string }>;
}) {
  const { locale, id } = await params;
  const sp = await searchParams;
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

  const labels = {
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

  const examLabels = {
    exams: te("exams"),
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
  };

  return (
    <AdminShell labels={labels} currentPath="/admin/courses">
      <div className="mb-6">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent"
        >
          <MaterialIcon name="arrow_back" size={18} />
          {ta("courses")}
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[1.875rem] font-semibold text-ink">{course.titleFr}</h1>
          <p className="mt-1 text-sm text-ink-muted">{course.titleEn}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge
              status={course.published ? "PUBLISHED" : "DRAFT"}
              label={course.published ? tc("published") : tc("draft")}
            />
            <span className="text-sm text-ink-muted">{levelName(course.level, locale)}</span>
            <span className="text-sm text-ink-muted">
              {formatPrice(course.price.toString(), course.currency, locale)}
            </span>
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link href={`/admin/courses?modal=edit&id=${course.id}`}>
            <MaterialIcon name="edit" size={18} />
            {tc("edit")}
          </Link>
        </Button>
      </div>

      <section className="mt-12">
        <div className="flex items-center gap-2">
          <MaterialIcon name="category" className="text-accent" size={22} />
          <h2 className="text-xl font-semibold text-ink">{te("categories")}</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {course.examCategories.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent"
            >
              {locale === "fr" ? cat.nameFr : cat.nameEn}
            </span>
          ))}
        </div>
        <form
          action={async (fd) => {
            "use server";
            await addExamCategory(course.id, fd, locale);
          }}
          className="mt-4 flex flex-wrap gap-2"
        >
          <Input name="nameFr" placeholder="Nom FR" className="max-w-xs" required />
          <Input name="nameEn" placeholder="Name EN" className="max-w-xs" required />
          <Input name="slug" placeholder="slug" className="max-w-[10rem]" required />
          <Button type="submit" variant="secondary" size="sm">
            <MaterialIcon name="add" size={18} />
            {te("addCategory")}
          </Button>
        </form>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-2">
          <MaterialIcon name="view_module" className="text-accent" size={22} />
          <h2 className="text-xl font-semibold text-ink">{ta("modules")}</h2>
        </div>
        <div className="mt-6 space-y-4">
          {course.modules.map((mod, index) => (
            <div key={mod.id} className="rounded-xl bg-surface p-5 shadow-sm">
              <p className="font-medium text-ink">
                {index + 1}. {mod.titleFr}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                {mod.lessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-2">
                    <MaterialIcon name="menu_book" size={16} />
                    {l.titleFr}
                  </li>
                ))}
              </ul>
              <form
                action={async (fd) => {
                  "use server";
                  await addLesson(mod.id, course.id, fd, locale);
                }}
                className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2"
              >
                <Input name="titleFr" placeholder={ta("titleFr")} required />
                <Input name="titleEn" placeholder={ta("titleEn")} required />
                <Input name="contentType" defaultValue="text" required />
                <Input name="order" type="number" defaultValue={mod.lessons.length} required />
                <Button type="submit" size="sm" variant="secondary" className="w-fit">
                  {ta("addLesson")}
                </Button>
              </form>
            </div>
          ))}
        </div>
        <form
          action={async (fd) => {
            "use server";
            const { addModule } = await import("@/actions/courses");
            await addModule(course.id, fd, locale);
          }}
          className="mt-4 flex flex-wrap gap-2"
        >
          <Input name="titleFr" placeholder={ta("titleFr")} className="max-w-xs" required />
          <Input name="titleEn" placeholder={ta("titleEn")} className="max-w-xs" required />
          <Input name="order" type="number" defaultValue={course.modules.length} className="w-20" required />
          <Button type="submit" variant="secondary">
            {ta("addModule")}
          </Button>
        </form>
      </section>

      <ExamBuilder
        locale={locale}
        courseId={course.id}
        exams={course.exams}
        categories={course.examCategories}
        levels={levels}
        selectedExamId={sp.exam}
        labels={examLabels}
      />
    </AdminShell>
  );
}
