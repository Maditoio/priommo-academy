"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormActions } from "@/components/admin/form-actions";
import { FormSheet } from "@/components/admin/form-sheet";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCertification, updateCertification } from "@/actions/certifications";

type Level = { id: string; nameFr: string; nameEn: string };

type Certification = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  levelId: string;
  rank: number;
  validityMonths: number;
  courseId: string | null;
};

interface CertificationsAdminProps {
  locale: string;
  levels: Level[];
  courses: { id: string; titleFr: string }[];
  labels: Record<string, string>;
  editCert?: Certification | null;
}

export function CertificationsAdmin({
  locale,
  levels,
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
    <FormSheet
      open={isOpen}
      onOpenChange={(open) => !open && closeSheet()}
      title={modal === "create" ? labels.createCertification : labels.edit}
    >
      <form
        action={async (fd) => {
          if (cert) await updateCertification(cert.id, fd, locale);
          else await createCertification(fd, locale);
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
            defaultValues={cert ?? undefined}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="levelId">{labels.level}</Label>
              <select
                id="levelId"
                name="levelId"
                defaultValue={cert?.levelId}
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
              <Label htmlFor="rank">{labels.rank ?? "Rank"}</Label>
              <Input id="rank" name="rank" type="number" min={0} defaultValue={cert?.rank ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validityMonths">{labels.validityMonths}</Label>
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
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm shadow-sm transition-all duration-200 ease-out hover:border-accent/35 hover:shadow-md focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
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
        </div>
        <FormActions
          submitLabel={labels.save ?? "Save"}
          cancelLabel={labels.cancel ?? "Cancel"}
          onCancel={closeSheet}
        />
      </form>
    </FormSheet>
  );
}
