"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { updateCourse, addModule, addLesson, addExam } from "@/actions/courses";
import { createCourse } from "@/actions/courses";

type Lesson = { id: string; titleFr: string; titleEn: string; contentType: string };
type Module = { id: string; titleFr: string; titleEn: string; lessons: Lesson[] };
type Exam = { id: string; titleFr: string; titleEn: string; passingScore: number };

type CourseDetail = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  level: string;
  price: { toString(): string };
  currency: string;
  imageUrl: string | null;
  published: boolean;
  modules: Module[];
  exams: Exam[];
};

interface CoursesAdminProps {
  locale: string;
  labels: Record<string, string>;
  editCourse?: CourseDetail | null;
}

export function CoursesAdmin({ locale, labels, editCourse }: CoursesAdminProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");
  const isOpen = modal === "create" || modal === "edit";
  const course = modal === "edit" ? editCourse : null;

  function closeSheet() {
    router.push(`/${locale}/admin/courses`);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {modal === "create" ? labels.createCourse : course?.titleFr ?? labels.edit}
          </SheetTitle>
        </SheetHeader>

        <form
          action={async (fd) => {
            if (course) await updateCourse(course.id, fd, locale);
            else await createCourse(fd, locale);
          }}
          className="mt-6 space-y-6"
        >
          <BilingualFields
            labels={{
              titleFr: labels.titleFr,
              titleEn: labels.titleEn,
              descriptionFr: labels.descriptionFr,
              descriptionEn: labels.descriptionEn,
            }}
            defaultValues={course ?? undefined}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">{labels.slug}</Label>
              <Input id="slug" name="slug" defaultValue={course?.slug} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">{labels.level}</Label>
              <Input id="level" name="level" defaultValue={course?.level} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{labels.price}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={course?.price.toString() ?? "0"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{labels.currency}</Label>
              <Input id="currency" name="currency" defaultValue={course?.currency ?? "USD"} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="imageUrl">{labels.imageUrl}</Label>
              <Input id="imageUrl" name="imageUrl" defaultValue={course?.imageUrl ?? ""} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={course?.published} className="rounded" />
            {labels.publish}
          </label>
          <Button type="submit">{labels.save}</Button>
        </form>

        {course && (
          <>
            <Separator className="my-8" />
            <h3 className="text-base font-semibold text-ink">{labels.modules}</h3>
            {course.modules.map((mod) => (
              <div key={mod.id} className="mt-4 rounded-xl bg-bg p-4">
                <p className="font-medium text-ink">
                  {mod.titleFr} / {mod.titleEn}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                  {mod.lessons.map((l) => (
                    <li key={l.id}>
                      • {l.titleFr} ({l.contentType})
                    </li>
                  ))}
                </ul>
                <form
                  action={async (fd) => addLesson(mod.id, course.id, fd, locale)}
                  className="mt-4 grid gap-2 sm:grid-cols-2"
                >
                  <Input name="titleFr" placeholder={labels.titleFr} required />
                  <Input name="titleEn" placeholder={labels.titleEn} required />
                  <Input name="contentType" placeholder="video | pdf | text" defaultValue="text" required />
                  <Input name="order" type="number" defaultValue={mod.lessons.length} required />
                  <Input name="durationMin" type="number" placeholder="Duration (min)" className="sm:col-span-2" />
                  <Textarea name="bodyFr" placeholder="Body FR" className="sm:col-span-2" />
                  <Button type="submit" size="sm">
                    {labels.addLesson}
                  </Button>
                </form>
              </div>
            ))}

            <form action={async (fd) => addModule(course.id, fd, locale)} className="mt-4 flex flex-wrap gap-2">
              <Input name="titleFr" placeholder={labels.titleFr} className="max-w-xs" required />
              <Input name="titleEn" placeholder={labels.titleEn} className="max-w-xs" required />
              <Input name="order" type="number" defaultValue={course.modules.length} className="w-20" required />
              <Button type="submit" variant="secondary">
                {labels.addModule}
              </Button>
            </form>

            <Separator className="my-8" />
            <h3 className="text-base font-semibold text-ink">Exam</h3>
            {course.exams.map((exam) => (
              <p key={exam.id} className="mt-2 text-sm text-ink-muted">
                {exam.titleFr} — {exam.passingScore}%
              </p>
            ))}
            <form action={async (fd) => addExam(course.id, fd, locale)} className="mt-4 flex flex-wrap gap-2">
              <Input name="titleFr" placeholder={labels.titleFr} className="max-w-xs" required />
              <Input name="titleEn" placeholder={labels.titleEn} className="max-w-xs" required />
              <Input name="passingScore" type="number" defaultValue={70} className="w-24" />
              <Button type="submit" variant="secondary">
                Add exam
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
