import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createCourse } from "@/actions/courses";
import { AdminShell } from "@/components/admin/admin-shell";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";

const LEVELS = ["Débutant", "Professionnel", "Spécialisé", "Exécutif"];

export default async function NewCoursePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");

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
    <AdminShell labels={labels} currentPath="/admin/courses">
      <h1 className="text-2xl font-bold">{ta("createCourse")}</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{ta("courses")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCourse} className="space-y-6">
            <BilingualFields labels={{
              titleFr: ta("titleFr"),
              titleEn: ta("titleEn"),
              descriptionFr: ta("descriptionFr"),
              descriptionEn: ta("descriptionEn"),
            }} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">{ta("slug")}</Label>
                <Input id="slug" name="slug" required placeholder="mon-cours" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">{ta("level")}</Label>
                <select id="level" name="level" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">—</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">{ta("price")}</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{ta("currency")}</Label>
                <Input id="currency" name="currency" defaultValue="USD" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="imageUrl">{ta("imageUrl")}</Label>
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://..." />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" className="rounded" />
              {ta("publish")}
            </label>
            <Button type="submit">{ta("createCourse")}</Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
