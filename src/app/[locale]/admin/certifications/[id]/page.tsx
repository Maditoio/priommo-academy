import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateCertification } from "@/actions/certifications";
import { AdminShell } from "@/components/admin/admin-shell";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function EditCertificationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const tc = await getTranslations("common");

  const [certification, courses] = await Promise.all([
    db.certification.findUnique({ where: { id } }),
    db.course.findMany({ orderBy: { titleFr: "asc" } }),
  ]);

  if (!certification) notFound();

  const labels = {
    title: ta("title"),
    overview: ta("overview"),
    courses: ta("courses"),
    certifications: ta("certifications"),
    enrollments: ta("enrollments"),
    certificates: ta("certificates"),
    users: ta("users"),
    organizations: ta("organizations"),
    payments: ta("payments"),
  };

  return (
    <AdminShell labels={labels} currentPath="/admin/certifications">
      <h1 className="text-2xl font-bold">{certification.titleFr}</h1>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <form action={updateCertification.bind(null, id)} className="space-y-6">
            <BilingualFields
              labels={{
                titleFr: ta("titleFr"),
                titleEn: ta("titleEn"),
                descriptionFr: ta("descriptionFr"),
                descriptionEn: ta("descriptionEn"),
              }}
              defaultValues={certification}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">{ta("slug")}</Label>
                <Input id="slug" name="slug" defaultValue={certification.slug} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">{ta("level")}</Label>
                <Input id="level" name="level" defaultValue={certification.level} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="courseId">{ta("linkedCourse")}</Label>
                <select
                  id="courseId"
                  name="courseId"
                  defaultValue={certification.courseId ?? ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.titleFr}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit">{tc("save")}</Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
