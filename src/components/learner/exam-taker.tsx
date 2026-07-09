"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { submitExamAnswers } from "@/actions/exams";
import { localizedField } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Choice = { id: string; labelFr: string; labelEn: string };
type Question = {
  id: string;
  promptFr: string;
  promptEn: string;
  choices: Choice[];
  category: { nameFr: string; nameEn: string };
};

interface ExamTakerProps {
  attemptId: string;
  locale: string;
  endsAt: string;
  questions: Question[];
  labels: {
    submit: string;
    timeRemaining: string;
    question: string;
    of: string;
  };
}

export function ExamTaker({ attemptId, locale, endsAt, questions, labels }: ExamTakerProps) {
  const router = useRouter();
  const end = new Date(endsAt).getTime();
  const [remaining, setRemaining] = useState(Math.max(0, end - Date.now()));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const left = Math.max(0, end - Date.now());
      setRemaining(left);
      if (left <= 0) {
        clearInterval(t);
        void handleSubmit(true);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  async function handleSubmit(timedOut = false) {
    if (submitting) return;
    setSubmitting(true);
    const fd = new FormData();
    for (const [qId, choiceId] of Object.entries(answers)) {
      fd.set(`q_${qId}`, choiceId);
    }
    await submitExamAnswers(attemptId, locale, fd, timedOut);
    router.refresh();
  }

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const urgent = remaining < 5 * 60 * 1000;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:min-h-screen lg:flex-row">
      <aside className="border-b border-border bg-surface lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:flex-col lg:items-stretch lg:gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
              urgent ? "bg-danger/10 text-danger" : "bg-accent-soft text-accent"
            )}
          >
            <MaterialIcon name="timer" size={20} />
            {mins}:{secs.toString().padStart(2, "0")}
          </div>
          <p className="text-sm text-ink-muted">
            {answeredCount}/{questions.length} {labels.question.toLowerCase()}s
          </p>
        </div>
        <div className="hidden max-h-[calc(100vh-8rem)] overflow-y-auto px-3 pb-4 lg:block">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, i) => {
              const answered = !!answers[question.id];
              const active = i === current;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                    active
                      ? "bg-accent text-white"
                      : answered
                        ? "bg-success/15 text-success"
                        : "bg-surface-hover text-ink-muted hover:text-ink"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-border bg-surface px-5 py-3 lg:px-8">
          <p className="text-sm text-ink-muted">
            {labels.question} {current + 1} {labels.of} {questions.length}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-10 lg:py-8">
          {q && (
            <div className="mx-auto max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {locale === "fr" ? q.category.nameFr : q.category.nameEn}
              </p>
              <h2 className="mt-3 text-xl font-semibold leading-snug text-ink lg:text-2xl">
                {localizedField(q, "prompt", locale)}
              </h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {q.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      answers[q.id] === choice.id
                        ? "border-accent bg-accent-soft shadow-sm"
                        : "border-border bg-surface hover:border-accent/40 hover:bg-surface-hover"
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={choice.id}
                      checked={answers[q.id] === choice.id}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: choice.id }))}
                      className="mt-1 accent-accent"
                    />
                    <span className="text-sm leading-relaxed text-ink">
                      {locale === "fr" ? choice.labelFr : choice.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-5 py-4 lg:px-10">
          <Button
            type="button"
            variant="secondary"
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
          >
            <MaterialIcon name="chevron_left" size={18} />
          </Button>
          {current < questions.length - 1 ? (
            <Button type="button" onClick={() => setCurrent((c) => c + 1)}>
              {labels.question} {current + 2}
              <MaterialIcon name="chevron_right" size={18} />
            </Button>
          ) : (
            <Button type="button" disabled={submitting} onClick={() => handleSubmit(false)}>
              <MaterialIcon name="task_alt" size={18} />
              {labels.submit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
