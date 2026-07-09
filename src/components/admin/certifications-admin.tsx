"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCertification, updateCertification } from "@/actions/certifications";

type Certification = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  level: string;
  rank: number;
  validityMonths: number;
  courseId: string | null;
};

interface CertificationsAdminProps {
  locale: string;
  certifications: Certification[];
  courses: { id: string; titleFr: string }[];
  labels: Record<string, string>;
  editCert?: Certification | null;
}

export function CertificationsAdmin({
  locale,
  certifications,
  courses,
  labels,
  editCert,
}: CertificationsAdminProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");
  const editId = searchParams.get("id");
  const isOpen = modal === "create" || modal === "edit";
  const cert = modal === "edit" && editId ? editCert : null;

  function closeSheet() {
    router.push(`/${locale}/admin/certifications`);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {modal === "create" ? labels.createCertification : labels.edit}
          </SheetTitle>
        </SheetHeader>

        <form
          action={async (fd) => {
            if (cert) await updateCertification(cert.id, fd, locale);
            else await createCertification(fd, locale);
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
            defaultValues={cert ?? undefined}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">{labels.slug}</Label>
              <Input id="slug" name="slug" defaultValue={cert?.slug} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">{labels.level}</Label>
              <Input id="level" name="level" defaultValue={cert?.level} required placeholder="Débutant" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rank">{labels.rank ?? "Rank"}</Label>
              <Input id="rank" name="rank" type="number" min={0} defaultValue={cert?.rank ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validityMonths">{labels.validityMonths ?? "Validity (months)"}</Label>
              <Input
                id="validityMonths"
                name="validityMonths"
                type="number"
                min={1}
                defaultValue={cert?.validityMonths ?? 24}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="courseId">{labels.linkedCourse}</Label>
              <select
                id="courseId"
                name="courseId"
                defaultValue={cert?.courseId ?? ""}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm"
              >
                <option value="">—</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titleFr}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit">{labels.save ?? "Save"}</Button>
            <Button type="button" variant="secondary" onClick={closeSheet}>
              {labels.cancel ?? "Cancel"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
