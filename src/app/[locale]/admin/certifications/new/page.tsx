import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createCertification } from "@/actions/certifications";
import { AdminShell } from "@/components/admin/admin-shell";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function NewCertificationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const courses = await db.course.findMany({ orderBy: { titleFr: "asc" } });

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
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">{ta("createCertification")}</h1>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <form action={createCertification} className="space-y-6">
            <BilingualFields labels={{
              titleFr: ta("titleFr"),
              titleEn: ta("titleEn"),
              descriptionFr: ta("descriptionFr"),
              descriptionEn: ta("descriptionEn"),
            }} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">{ta("slug")}</Label>
                <Input id="slug" name="slug" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">{ta("level")}</Label>
                <Input id="level" name="level" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="courseId">{ta("linkedCourse")}</Label>
                <select id="courseId" name="courseId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">—</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.titleFr}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit">{ta("createCertification")}</Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
