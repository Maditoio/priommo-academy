"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormActions } from "@/components/admin/form-actions";
import { FormSheet } from "@/components/admin/form-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

export type LessonFormData = {
  id: string;
  moduleId: string;
  titleFr: string;
  titleEn: string;
  contentType: string;
  contentUrl: string | null;
  bodyFr: string | null;
  bodyEn: string | null;
  order: number;
  durationMin: number | null;
};

interface LessonAdminSheetProps {
  locale: string;
  courseId: string;
  lessons: LessonFormData[];
  labels: {
    editLesson: string;
    addLesson: string;
    save: string;
    cancel: string;
    delete: string;
    titleFr: string;
    titleEn: string;
    contentType: string;
    contentUrl: string;
    bodyFr: string;
    bodyEn: string;
    lessonOrder: string;
    duration: string;
    contentTypeText: string;
    contentTypeVideo: string;
    contentTypePdf: string;
    lessonEditDesc: string;
  };
  onUpdateLesson: (formData: FormData) => Promise<void>;
  onDeleteLesson: (lessonId: string) => Promise<void>;
}

export function LessonAdminSheet({
  locale,
  courseId,
  lessons,
  labels,
  onUpdateLesson,
  onDeleteLesson,
}: LessonAdminSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const lesson = lessonId ? lessons.find((l) => l.id === lessonId) : null;
  const isOpen = Boolean(lesson);

  function closeSheet() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lesson");
    params.set("tab", "curriculum");
    router.push(`/${locale}/admin/courses/${courseId}?${params.toString()}`);
  }

  if (!lesson) return null;

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={(open) => !open && closeSheet()}
      title={labels.editLesson}
      description={labels.lessonEditDesc}
    >
      <form action={onUpdateLesson} className="flex flex-col">
        <input type="hidden" name="lessonId" value={lesson.id} />
        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-titleFr">{labels.titleFr}</Label>
              <Input id="edit-titleFr" name="titleFr" defaultValue={lesson.titleFr} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-titleEn">{labels.titleEn}</Label>
              <Input id="edit-titleEn" name="titleEn" defaultValue={lesson.titleEn} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit-contentType">{labels.contentType}</Label>
              <select
                id="edit-contentType"
                name="contentType"
                defaultValue={lesson.contentType}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm shadow-sm transition-all duration-200 ease-out hover:border-accent/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              >
                <option value="text">{labels.contentTypeText}</option>
                <option value="video">{labels.contentTypeVideo}</option>
                <option value="pdf">{labels.contentTypePdf}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">{labels.duration}</Label>
              <Input
                id="edit-duration"
                name="durationMin"
                type="number"
                min={0}
                defaultValue={lesson.durationMin ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-order">{labels.lessonOrder}</Label>
              <Input id="edit-order" name="order" type="number" min={0} defaultValue={lesson.order} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-contentUrl">{labels.contentUrl}</Label>
            <Input
              id="edit-contentUrl"
              name="contentUrl"
              type="url"
              placeholder="https://..."
              defaultValue={lesson.contentUrl ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bodyFr">{labels.bodyFr}</Label>
            <Textarea
              id="edit-bodyFr"
              name="bodyFr"
              rows={5}
              defaultValue={lesson.bodyFr ?? ""}
              className="resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bodyEn">{labels.bodyEn}</Label>
            <Textarea
              id="edit-bodyEn"
              name="bodyEn"
              rows={5}
              defaultValue={lesson.bodyEn ?? ""}
              className="resize-y"
            />
          </div>
        </div>

        <FormActions submitLabel={labels.save} cancelLabel={labels.cancel} onCancel={closeSheet} />
      </form>

      <div className="border-t border-border/60 px-6 py-4">
        <form action={onDeleteLesson.bind(null, lesson.id)}>
          <Button type="submit" variant="ghost" size="sm" className="text-danger hover:text-danger">
            <MaterialIcon name="delete" size={18} />
            {labels.delete}
          </Button>
        </form>
      </div>
    </FormSheet>
  );
}
