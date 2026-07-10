"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormActions } from "@/components/admin/form-actions";
import { FormSheet } from "@/components/admin/form-sheet";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourse, updateCourse } from "@/actions/courses";

type Level = { id: string; nameFr: string; nameEn: string };

type CourseBasic = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  levelId: string;
  price: { toString(): string };
  currency: string;
  imageUrl: string | null;
  published: boolean;
};

interface CoursesAdminProps {
  locale: string;
  labels: Record<string, string>;
  levels: Level[];
  editCourse?: CourseBasic | null;
}

export function CoursesAdmin({ locale, labels, levels, editCourse }: CoursesAdminProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");
  const isOpen = modal === "create" || modal === "edit";
  const course = modal === "edit" ? editCourse : null;

  function closeSheet() {
    router.push(`/${locale}/admin/courses`);
  }

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={(open) => !open && closeSheet()}
      title={modal === "create" ? labels.createCourse : (course?.titleFr ?? labels.edit)}
    >
      <form
        action={async (fd) => {
          if (course) await updateCourse(course.id, fd, locale);
          else await createCourse(fd, locale);
        }}
        className="flex flex-col"
      >
        <div className="space-y-6 px-6 py-5">
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
              <Label htmlFor="levelId">{labels.level}</Label>
              <select
                id="levelId"
                name="levelId"
                defaultValue={course?.levelId}
                required
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm shadow-sm transition-all duration-200 ease-out hover:border-accent/35 hover:shadow-md focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              >
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nameFr}
                  </option>
                ))}
              </select>
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
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="published" defaultChecked={course?.published} className="rounded" />
            {labels.publish}
          </label>
        </div>
        <FormActions
          submitLabel={labels.save}
          cancelLabel={labels.cancel ?? "Cancel"}
          onCancel={closeSheet}
        />
      </form>
    </FormSheet>
  );
}
