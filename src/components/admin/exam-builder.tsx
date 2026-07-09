"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaterialIcon } from "@/components/ui/material-icon";
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
}

export function ExamBuilder({
  locale,
  courseId,
  exams,
  categories,
  levels,
  selectedExamId,
  labels,
}: ExamBuilderProps) {
  const router = useRouter();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const selected = exams.find((e) => e.id === selectedExamId) ?? exams[0] ?? null;

  function selectExam(id: string) {
    router.push(`/${locale}/admin/courses/${courseId}?exam=${id}`);
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-2">
        <MaterialIcon name="quiz" className="text-accent" size={22} />
        <h2 className="text-xl font-semibold text-ink">{labels.exams}</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {exams.map((exam) => (
          <Button
            key={exam.id}
            type="button"
            variant={selected?.id === exam.id ? "default" : "secondary"}
            size="sm"
            onClick={() => selectExam(exam.id)}
          >
            <MaterialIcon name={exam.isPractice ? "fitness_center" : "assignment"} size={16} />
            {exam.titleFr}
          </Button>
        ))}
      </div>

      {selected && (
        <div className="space-y-6 rounded-xl bg-surface p-6 shadow-sm">
          <form
            action={async (fd) => updateExam(selected.id, courseId, fd, locale)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <Label>{labels.titleFr}</Label>
              <Input name="titleFr" defaultValue={selected.titleFr} required />
            </div>
            <div className="space-y-2">
              <Label>{labels.titleEn}</Label>
              <Input name="titleEn" defaultValue={selected.titleEn} required />
            </div>
            <div className="space-y-2">
              <Label>{labels.passingScore}</Label>
              <Input name="passingScore" type="number" defaultValue={selected.passingScore} />
            </div>
            <div className="space-y-2">
              <Label>{labels.duration}</Label>
              <Input name="durationMin" type="number" defaultValue={selected.durationMin} />
            </div>
            <div className="space-y-2">
              <Label>{labels.maxAttempts}</Label>
              <Input name="maxAttempts" type="number" defaultValue={selected.maxAttempts} />
            </div>
            <div className="space-y-2">
              <Label>{labels.questionCount}</Label>
              <Input
                name="questionCount"
                type="number"
                defaultValue={selected.questionCount ?? ""}
                placeholder={labels.allQuestions}
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="isPractice" defaultChecked={selected.isPractice} />
              {labels.practiceExam}
            </label>
            <Button type="submit" className="w-fit">
              <MaterialIcon name="save" size={18} />
              {labels.save}
            </Button>
          </form>

          {!selected.isPractice && categories.length > 0 && (
            <div className="border-t border-border pt-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MaterialIcon name="category" size={18} className="text-accent" />
                {labels.categoryRequirements}
              </h3>
              <div className="mt-4 space-y-3">
                {categories.map((cat) => {
                  const req = selected.categoryReqs.find((r) => r.categoryId === cat.id);
                  return (
                    <form
                      key={cat.id}
                      action={async (fd) =>
                        setExamCategoryRequirement(selected.id, courseId, fd, locale)
                      }
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="categoryId" value={cat.id} />
                      <span className="min-w-[8rem] text-sm text-ink">{cat.nameFr}</span>
                      <Input
                        name="minScore"
                        type="number"
                        defaultValue={req?.minScore ?? 60}
                        className="w-24"
                        placeholder="Min %"
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        {labels.save}
                      </Button>
                    </form>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MaterialIcon name="checklist" size={18} className="text-accent" />
                {labels.questions} ({selected.questions.length})
              </h3>
              <Button type="button" size="sm" onClick={() => setShowQuestionForm(true)}>
                <MaterialIcon name="add_circle" size={18} />
                {labels.addQuestion}
              </Button>
            </div>

            <ul className="mt-4 space-y-2">
              {selected.questions.map((q, i) => (
                <li
                  key={q.id}
                  className="rounded-xl border border-border px-4 py-3 text-sm text-ink-muted"
                >
                  <span className="font-medium text-ink">
                    {i + 1}. {q.promptFr}
                  </span>
                  <span className="ml-2 text-xs">({q.choices.length} choices)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form
        action={async (fd) => addExam(courseId, fd, locale)}
        className="rounded-xl border border-dashed border-border bg-surface/50 p-5"
      >
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <MaterialIcon name="add" size={18} />
          {labels.addExam}
        </p>
        <div className="flex flex-wrap gap-2">
          <Input name="titleFr" placeholder={labels.titleFr} className="max-w-xs" required />
          <Input name="titleEn" placeholder={labels.titleEn} className="max-w-xs" required />
          <Input name="passingScore" type="number" defaultValue={70} className="w-20" />
          <Input name="durationMin" type="number" defaultValue={60} className="w-20" />
          <Input name="maxAttempts" type="number" defaultValue={3} className="w-20" />
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="isPractice" />
            {labels.practice}
          </label>
          <Button type="submit" variant="secondary">
            {labels.addExam}
          </Button>
        </div>
      </form>

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
                <Textarea name="promptFr" required />
              </div>
              <div className="space-y-2">
                <Label>{labels.promptEn}</Label>
                <Textarea name="promptEn" required />
              </div>
              <input type="hidden" name="order" value={selected.questions.length} />
              <p className="text-sm font-medium text-ink">{labels.choices}</p>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <Input name="choiceFr" placeholder={`Choice ${i + 1} FR`} required={i < 2} />
                  <Input name="choiceEn" placeholder={`Choice ${i + 1} EN`} required={i < 2} />
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
              <Button type="submit">
                <MaterialIcon name="save" size={18} />
                {labels.save}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
