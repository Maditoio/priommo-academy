"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormActions } from "@/components/admin/form-actions";
import { FormSheet } from "@/components/admin/form-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLevel, updateLevel } from "@/actions/levels";

type Level = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  rank: number;
};

interface LevelsAdminProps {
  locale: string;
  editLevel?: Level | null;
  labels: Record<string, string>;
}

export function LevelsAdmin({ locale, editLevel, labels }: LevelsAdminProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");
  const isOpen = modal === "create" || modal === "edit";
  const level = modal === "edit" ? editLevel : null;

  function closeSheet() {
    router.push(`/${locale}/admin/levels`);
  }

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={(open) => !open && closeSheet()}
      title={modal === "create" ? labels.addLevel : labels.edit}
    >
      <form
        action={async (fd) => {
          if (level) await updateLevel(level.id, fd, locale);
          else await createLevel(fd, locale);
        }}
        className="flex flex-col"
      >
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="nameFr">{labels.nameFr}</Label>
            <Input id="nameFr" name="nameFr" defaultValue={level?.nameFr} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameEn">{labels.nameEn}</Label>
            <Input id="nameEn" name="nameEn" defaultValue={level?.nameEn} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rank">{labels.rank}</Label>
            <Input id="rank" name="rank" type="number" defaultValue={level?.rank ?? 0} required />
          </div>
        </div>
        <FormActions
          submitLabel={labels.save}
          cancelLabel={labels.cancel}
          onCancel={closeSheet}
        />
      </form>
    </FormSheet>
  );
}
