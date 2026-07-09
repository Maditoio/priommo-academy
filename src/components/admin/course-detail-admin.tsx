"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ExamBuilder } from "@/components/admin/exam-builder";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type TabId = "curriculum" | "categories" | "exams";

type Lesson = { id: string; titleFr: string; titleEn: string; durationMin: number | null; order: number };
type Module = { id: string; titleFr: string; titleEn: string; order: number; lessons: Lesson[] };
type Category = { id: string; nameFr: string; nameEn: string; slug: string };
type Level = { id: string; nameFr: string; nameEn: string };
type Choice = { id: string; labelFr: string; labelEn: string; isCorrect: boolean };
type Question = {
  id: string;
  promptFr: string;
  promptEn: string;
  levelId: string;
  categoryId: string;
  choices: Choice[];
};
type Exam = {
  id: string;
  titleFr: string;
  titleEn: string;
  passingScore: number;
  durationMin: number;
  maxAttempts: number;
  isPractice: boolean;
  questionCount: number | null;
  questions: Question[];
  categoryReqs: { categoryId: string; minScore: number; category: Category }[];
};

export type CourseDetailData = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  published: boolean;
  levelLabel: string;
  priceLabel: string;
  enrollmentCount: number;
  modules: Module[];
  examCategories: Category[];
  exams: Exam[];
};

type Labels = {
  back: string;
  edit: string;
  preview: string;
  published: string;
  draft: string;
  modules: string;
  lessons: string;
  enrollments: string;
  exams: string;
  questions: string;
  tabCurriculum: string;
  tabCategories: string;
  tabExams: string;
  addModule: string;
  addLesson: string;
  addCategory: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  noModules: string;
  noCategories: string;
  moduleOrder: string;
  lessonOrder: string;
  duration: string;
  categoriesSubtitle: string;
  curriculumSubtitle: string;
  examsSubtitle: string;
  examLabels: Record<string, string>;
};

interface CourseDetailAdminProps {
  locale: string;
  course: CourseDetailData;
  levels: Level[];
  labels: Labels;
  onAddModule: (formData: FormData) => Promise<void>;
  onAddLesson: (formData: FormData) => Promise<void>;
  onAddCategory: (formData: FormData) => Promise<void>;
}

const TABS: { id: TabId; icon: string }[] = [
  { id: "curriculum", icon: "view_module" },
  { id: "categories", icon: "category" },
  { id: "exams", icon: "quiz" },
];

export function CourseDetailAdmin({
  locale,
  course,
  levels,
  labels,
  onAddModule,
  onAddLesson,
  onAddCategory,
}: CourseDetailAdminProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabId) || "curriculum";
  const selectedExamId = searchParams.get("exam");

  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const questionCount = course.exams.reduce((n, e) => n + e.questions.length, 0);

  function setTab(tab: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab !== "exams") params.delete("exam");
    router.push(`/${locale}/admin/courses/${course.id}?${params.toString()}`);
  }

  const tabLabels: Record<TabId, string> = {
    curriculum: labels.tabCurriculum,
    categories: labels.tabCategories,
    exams: labels.tabExams,
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/admin/courses" className="inline-flex items-center gap-1 hover:text-accent">
          <MaterialIcon name="arrow_back" size={16} />
          {labels.back}
        </Link>
        <MaterialIcon name="chevron_right" size={16} className="opacity-50" />
        <span className="truncate text-ink">{course.titleFr}</span>
      </nav>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
        <div className="bg-accent-soft/40 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={course.published ? "PUBLISHED" : "DRAFT"}
                  label={course.published ? labels.published : labels.draft}
                />
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                  {course.levelLabel}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {course.titleFr}
              </h1>
              <p className="mt-1 text-ink-muted">{course.titleEn}</p>
              <p className="mt-4 line-clamp-2 max-w-2xl text-sm text-ink-muted">
                {course.descriptionFr}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {course.published && (
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/courses/${course.slug}`} target="_blank">
                    <MaterialIcon name="open_in_new" size={18} />
                    {labels.preview}
                  </Link>
                </Button>
              )}
              <Button asChild size="sm">
                <Link href={`/admin/courses?modal=edit&id=${course.id}`}>
                  <MaterialIcon name="edit" size={18} />
                  {labels.edit}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border border-t border-border sm:grid-cols-5">
          <StatCell icon="view_module" label={labels.modules} value={course.modules.length} />
          <StatCell icon="menu_book" label={labels.lessons} value={lessonCount} />
          <StatCell icon="how_to_reg" label={labels.enrollments} value={course.enrollmentCount} />
          <StatCell icon="quiz" label={labels.exams} value={course.exams.length} />
          <StatCell
            icon="checklist"
            label={labels.questions}
            value={questionCount}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-muted hover:text-ink"
              )}
            >
              <MaterialIcon name={tab.icon} size={18} />
              {tabLabels[tab.id]}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "curriculum" && (
        <CurriculumTab
          course={course}
          labels={labels}
          onAddModule={onAddModule}
          onAddLesson={onAddLesson}
        />
      )}

      {activeTab === "categories" && (
        <CategoriesTab course={course} labels={labels} locale={locale} onAddCategory={onAddCategory} />
      )}

      {activeTab === "exams" && (
        <div>
          <p className="mb-6 text-sm text-ink-muted">{labels.examsSubtitle}</p>
          <ExamBuilder
            locale={locale}
            courseId={course.id}
            exams={course.exams}
            categories={course.examCategories}
            levels={levels}
            selectedExamId={selectedExamId}
            labels={labels.examLabels}
            embedded
          />
        </div>
      )}
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
  className,
}: {
  icon: string;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 px-5 py-4", className)}>
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        <MaterialIcon name={icon} size={14} className="text-accent" />
        {label}
      </div>
      <p className="text-xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function CurriculumTab({
  course,
  labels,
  onAddModule,
  onAddLesson,
}: {
  course: CourseDetailData;
  labels: Labels;
  onAddModule: (formData: FormData) => Promise<void>;
  onAddLesson: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">{labels.curriculumSubtitle}</p>

      {course.modules.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MaterialIcon name="view_module" className="text-ink-muted/40" size={48} />
            <p className="mt-4 text-ink-muted">{labels.noModules}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {course.modules.map((mod, index) => (
            <Card key={mod.id} className="overflow-hidden shadow-sm">
              <CardHeader className="bg-surface-hover/50 pb-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-sm font-semibold text-accent">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{mod.titleFr}</CardTitle>
                    <p className="mt-0.5 text-sm text-ink-muted">{mod.titleEn}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs text-ink-muted">
                    {mod.lessons.length} {labels.lessons.toLowerCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {mod.lessons.length > 0 ? (
                  <ul className="space-y-2">
                    {mod.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-bg/50 px-4 py-3"
                      >
                        <MaterialIcon name="menu_book" size={18} className="shrink-0 text-accent" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">{lesson.titleFr}</p>
                          <p className="text-xs text-ink-muted">{lesson.titleEn}</p>
                        </div>
                        {lesson.durationMin != null && (
                          <span className="flex shrink-0 items-center gap-1 text-xs text-ink-muted">
                            <MaterialIcon name="schedule" size={14} />
                            {lesson.durationMin} min
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-muted">—</p>
                )}

                <Separator className="my-5" />

                <form action={onAddLesson} className="space-y-4">
                  <input type="hidden" name="moduleId" value={mod.id} />
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <MaterialIcon name="add_circle" size={18} className="text-accent" />
                    {labels.addLesson}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{labels.titleFr}</Label>
                      <Input name="titleFr" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{labels.titleEn}</Label>
                      <Input name="titleEn" required />
                    </div>
                    <input type="hidden" name="contentType" value="text" />
                    <input type="hidden" name="order" value={mod.lessons.length} />
                  </div>
                  <Button type="submit" size="sm" variant="secondary">
                    {labels.addLesson}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MaterialIcon name="add" size={20} className="text-accent" />
            {labels.addModule}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onAddModule} className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{labels.titleFr}</Label>
              <Input name="titleFr" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{labels.titleEn}</Label>
              <Input name="titleEn" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{labels.moduleOrder}</Label>
              <Input name="order" type="number" defaultValue={course.modules.length} required />
            </div>
            <Button type="submit" className="w-fit sm:col-span-3">
              {labels.addModule}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesTab({
  course,
  labels,
  locale,
  onAddCategory,
}: {
  course: CourseDetailData;
  labels: Labels;
  locale: string;
  onAddCategory: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <p className="text-sm text-ink-muted">{labels.categoriesSubtitle}</p>

        {course.examCategories.length === 0 ? (
          <Card className="border-dashed shadow-sm">
            <CardContent className="py-12 text-center text-ink-muted">{labels.noCategories}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {course.examCategories.map((cat) => (
              <Card key={cat.id} className="shadow-sm">
                <CardContent className="flex items-start gap-3 pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
                    <MaterialIcon name="label" className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-ink">
                      {locale === "fr" ? cat.nameFr : cat.nameEn}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {locale === "fr" ? cat.nameEn : cat.nameFr}
                    </p>
                    <code className="mt-2 inline-block rounded-md bg-bg px-2 py-0.5 text-xs text-ink-muted">
                      {cat.slug}
                    </code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="h-fit shadow-sm lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MaterialIcon name="add_circle" size={20} className="text-accent" />
            {labels.addCategory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onAddCategory} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{labels.nameFr}</Label>
              <Input name="nameFr" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{labels.nameEn}</Label>
              <Input name="nameEn" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{labels.slug}</Label>
              <Input name="slug" placeholder="e.g. juridique" required />
            </div>
            <Button type="submit" className="w-full">
              {labels.addCategory}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
