"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{modal === "create" ? "New level" : "Edit level"}</SheetTitle>
        </SheetHeader>
        <form
          action={async (fd) => {
            if (level) await updateLevel(level.id, fd, locale);
            else await createLevel(fd, locale);
          }}
          className="mt-6 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="nameFr">Name (FR)</Label>
            <Input id="nameFr" name="nameFr" defaultValue={level?.nameFr} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameEn">Name (EN)</Label>
            <Input id="nameEn" name="nameEn" defaultValue={level?.nameEn} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rank">Rank</Label>
            <Input id="rank" name="rank" type="number" defaultValue={level?.rank ?? 0} required />
          </div>
          <Button type="submit">
            <MaterialIcon name="save" size={18} />
            Save
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
