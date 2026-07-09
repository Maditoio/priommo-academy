"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";
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
              <Label htmlFor="levelId">{labels.level}</Label>
              <select
                id="levelId"
                name="levelId"
                defaultValue={course?.levelId}
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
          <div className="flex gap-3 pt-2">
            <Button type="submit">
              <MaterialIcon name="save" size={18} />
              {labels.save}
            </Button>
            <Button type="button" variant="secondary" onClick={closeSheet}>
              {labels.cancel ?? "Cancel"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
