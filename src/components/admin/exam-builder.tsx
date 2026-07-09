"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  addExam,
  updateExam,
  addExamQuestion,
  setExamCategoryRequirement,
} from "@/actions/exams";

type Level = { id: string; nameFr: string; nameEn: string };
type Category = { id: string; nameFr: string; nameEn: string; slug: string };
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

interface ExamBuilderProps {
  locale: string;
  courseId: string;
  exams: Exam[];
  categories: Category[];
  levels: Level[];
  selectedExamId?: string | null;
  labels: Record<string, string>;
  embedded?: boolean;
}

export function ExamBuilder({
  locale,
  courseId,
  exams,
  categories,
  levels,
  selectedExamId,
  labels,
  embedded = false,
}: ExamBuilderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const selected = exams.find((e) => e.id === selectedExamId) ?? exams[0] ?? null;

  const officialExams = exams.filter((e) => !e.isPractice);
  const practiceExams = exams.filter((e) => e.isPractice);

  function selectExam(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "exams");
    params.set("exam", id);
    router.push(`/${locale}/admin/courses/${courseId}?${params.toString()}`);
  }

  const sidebar = (
    <div className="space-y-6">
      {officialExams.length > 0 && (
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {labels.officialExams ?? "Official"}
          </p>
          <div className="space-y-1">
            {officialExams.map((exam) => (
              <ExamListItem
                key={exam.id}
                exam={exam}
                selected={selected?.id === exam.id}
                onSelect={() => selectExam(exam.id)}
              />
            ))}
          </div>
        </div>
      )}
      {practiceExams.length > 0 && (
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {labels.practiceExams ?? "Practice"}
          </p>
          <div className="space-y-1">
            {practiceExams.map((exam) => (
              <ExamListItem
                key={exam.id}
                exam={exam}
                selected={selected?.id === exam.id}
                onSelect={() => selectExam(exam.id)}
                practice
              />
            ))}
          </div>
        </div>
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => setShowAddExam((v) => !v)}
      >
        <MaterialIcon name="add" size={18} />
        {labels.addExam}
      </Button>
      {showAddExam && (
        <Card className="border-dashed shadow-sm">
          <CardContent className="pt-5">
            <form action={async (fd) => addExam(courseId, fd, locale)} className="space-y-3">
              <Input name="titleFr" placeholder={labels.titleFr} required />
              <Input name="titleEn" placeholder={labels.titleEn} required />
              <div className="grid grid-cols-3 gap-2">
                <Input name="passingScore" type="number" defaultValue={70} placeholder="%" />
                <Input name="durationMin" type="number" defaultValue={60} placeholder="min" />
                <Input name="maxAttempts" type="number" defaultValue={3} />
              </div>
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                <input type="checkbox" name="isPractice" />
                {labels.practice}
              </label>
              <Button type="submit" size="sm" className="w-full">
                {labels.addExam}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const mainPanel = selected ? (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MaterialIcon
                  name={selected.isPractice ? "fitness_center" : "assignment"}
                  className="text-accent"
                  size={22}
                />
                {selected.titleFr}
              </CardTitle>
              <p className="mt-1 text-sm text-ink-muted">{selected.titleEn}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <BadgePill icon="timer" text={`${selected.durationMin} min`} />
              <BadgePill icon="percent" text={`${selected.passingScore}%`} />
              <BadgePill icon="checklist" text={`${selected.questions.length} Q`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            action={async (fd) => updateExam(selected.id, courseId, fd, locale)}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Field label={labels.titleFr} name="titleFr" defaultValue={selected.titleFr} />
            <Field label={labels.titleEn} name="titleEn" defaultValue={selected.titleEn} />
            <Field
              label={labels.passingScore}
              name="passingScore"
              type="number"
              defaultValue={selected.passingScore}
            />
            <Field
              label={labels.duration}
              name="durationMin"
              type="number"
              defaultValue={selected.durationMin}
            />
            <Field
              label={labels.maxAttempts}
              name="maxAttempts"
              type="number"
              defaultValue={selected.maxAttempts}
            />
            <Field
              label={labels.questionCount}
              name="questionCount"
              type="number"
              defaultValue={selected.questionCount ?? ""}
              placeholder={labels.allQuestions}
            />
            <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-3">
              <input type="checkbox" name="isPractice" defaultChecked={selected.isPractice} />
              {labels.practiceExam}
            </label>
            <Button type="submit" size="sm" className="w-fit">
              <MaterialIcon name="save" size={18} />
              {labels.save}
            </Button>
          </form>
        </CardContent>
      </Card>

      {!selected.isPractice && categories.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MaterialIcon name="category" size={20} className="text-accent" />
              {labels.categoryRequirements}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((cat) => {
              const req = selected.categoryReqs.find((r) => r.categoryId === cat.id);
              return (
                <form
                  key={cat.id}
                  action={async (fd) => setExamCategoryRequirement(selected.id, courseId, fd, locale)}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg/50 px-4 py-3"
                >
                  <input type="hidden" name="categoryId" value={cat.id} />
                  <span className="min-w-[8rem] flex-1 text-sm font-medium text-ink">{cat.nameFr}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      name="minScore"
                      type="number"
                      defaultValue={req?.minScore ?? 60}
                      className="w-20"
                    />
                    <span className="text-xs text-ink-muted">% min</span>
                  </div>
                  <Button type="submit" size="sm" variant="secondary">
                    {labels.save}
                  </Button>
                </form>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MaterialIcon name="checklist" size={20} className="text-accent" />
            {labels.questions}
            <span className="font-normal text-ink-muted">({selected.questions.length})</span>
          </CardTitle>
          <Button type="button" size="sm" onClick={() => setShowQuestionForm(true)}>
            <MaterialIcon name="add_circle" size={18} />
            {labels.addQuestion}
          </Button>
        </CardHeader>
        <CardContent>
          {selected.questions.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">—</p>
          ) : (
            <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {selected.questions.map((q, i) => (
                <li
                  key={q.id}
                  className="flex gap-3 rounded-xl border border-border px-4 py-3 text-sm"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-soft text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink line-clamp-2">{q.promptFr}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{q.choices.length} choices</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  ) : (
    <Card className="border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center py-16 text-center">
        <MaterialIcon name="quiz" className="text-ink-muted/30" size={56} />
        <p className="mt-4 text-ink-muted">{labels.addExam}</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      {embedded ? (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">{sidebar}</div>
          {mainPanel}
        </div>
      ) : (
        <div className="mt-12 space-y-8">
          <div className="flex items-center gap-2">
            <MaterialIcon name="quiz" className="text-accent" size={22} />
            <h2 className="text-xl font-semibold text-ink">{labels.exams}</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {sidebar}
            {mainPanel}
          </div>
        </div>
      )}

      <Sheet open={showQuestionForm} onOpenChange={setShowQuestionForm}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{labels.addQuestion}</SheetTitle>
          </SheetHeader>
          {selected && (
            <form
              action={async (fd) => {
                await addExamQuestion(selected.id, courseId, fd, locale);
                setShowQuestionForm(false);
              }}
              className="mt-6 space-y-4"
            >
              <div className="space-y-2">
                <Label>{labels.level}</Label>
                <select
                  name="levelId"
                  required
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm"
                >
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nameFr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{labels.category}</Label>
                <select
                  name="categoryId"
                  required
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameFr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{labels.promptFr}</Label>
                <Textarea name="promptFr" required rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{labels.promptEn}</Label>
                <Textarea name="promptEn" required rows={3} />
              </div>
              <input type="hidden" name="order" value={selected.questions.length} />
              <Separator />
              <p className="text-sm font-medium text-ink">{labels.choices}</p>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <Input name="choiceFr" placeholder={`FR ${i + 1}`} required={i < 2} />
                  <Input name="choiceEn" placeholder={`EN ${i + 1}`} required={i < 2} />
                </div>
              ))}
              <div className="space-y-2">
                <Label>{labels.correctAnswer}</Label>
                <select
                  name="correctIndex"
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm"
                >
                  {[0, 1, 2, 3].map((i) => (
                    <option key={i} value={i}>
                      Choice {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                <MaterialIcon name="save" size={18} />
                {labels.save}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ExamListItem({
  exam,
  selected,
  onSelect,
  practice,
}: {
  exam: Exam;
  selected: boolean;
  onSelect: () => void;
  practice?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
        selected ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-surface-hover hover:text-ink"
      )}
    >
      <MaterialIcon name={practice ? "fitness_center" : "assignment"} size={18} />
      <span className="truncate font-medium">{exam.titleFr}</span>
      <span className="ml-auto shrink-0 text-xs opacity-70">{exam.questions.length}</span>
    </button>
  );
}

function BadgePill({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
      <MaterialIcon name={icon} size={14} />
      {text}
    </span>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}
