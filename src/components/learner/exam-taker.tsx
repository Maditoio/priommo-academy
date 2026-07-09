"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { submitExamAnswers } from "@/actions/exams";
import { localizedField } from "@/lib/utils";

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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-16 z-40 mb-6 flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-md">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <MaterialIcon name="timer" className="text-accent" size={20} />
          {labels.timeRemaining}: {mins}:{secs.toString().padStart(2, "0")}
        </div>
        <span className="text-sm text-ink-muted">
          {labels.question} {current + 1} {labels.of} {questions.length}
        </span>
      </div>

      {q && (
        <div className="rounded-2xl bg-surface p-6 shadow-md">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            {locale === "fr" ? q.category.nameFr : q.category.nameEn}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-ink">
            {localizedField(q, "prompt", locale)}
          </h2>
          <div className="mt-6 space-y-2">
            {q.choices.map((choice) => (
              <label
                key={choice.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  answers[q.id] === choice.id
                    ? "border-accent bg-accent-soft"
                    : "border-border hover:bg-surface-hover"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={choice.id}
                  checked={answers[q.id] === choice.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: choice.id }))}
                  className="accent-accent"
                />
                <span className="text-sm text-ink">
                  {locale === "fr" ? choice.labelFr : choice.labelEn}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between gap-3">
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
  );
}
