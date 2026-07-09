import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateCourse, toggleCoursePublish, addModule, addLesson, addExam } from "@/actions/courses";
import { AdminShell } from "@/components/admin/admin-shell";
import { BilingualFields } from "@/components/admin/bilingual-fields";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const ta = await getTranslations("admin");
  const tc = await getTranslations("common");

  const course = await db.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      exams: true,
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{course.titleFr}</h1>
        <StatusBadge
          status={course.published ? "PUBLISHED" : "DRAFT"}
          label={course.published ? tc("published") : tc("draft")}
        />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>{tc("edit")}</CardTitle></CardHeader>
        <CardContent>
          <form action={updateCourse.bind(null, id)} className="space-y-6">
            <BilingualFields
              labels={{
                titleFr: ta("titleFr"),
                titleEn: ta("titleEn"),
                descriptionFr: ta("descriptionFr"),
                descriptionEn: ta("descriptionEn"),
              }}
              defaultValues={course}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">{ta("slug")}</Label>
                <Input id="slug" name="slug" defaultValue={course.slug} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">{ta("level")}</Label>
                <Input id="level" name="level" defaultValue={course.level} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">{ta("price")}</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={course.price.toString()} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{ta("currency")}</Label>
                <Input id="currency" name="currency" defaultValue={course.currency} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="imageUrl">{ta("imageUrl")}</Label>
                <Input id="imageUrl" name="imageUrl" defaultValue={course.imageUrl ?? ""} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={course.published} className="rounded" />
              {ta("publish")}
            </label>
            <Button type="submit">{tc("save")}</Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <h2 className="text-xl font-semibold">{ta("modules")}</h2>
      {course.modules.map((mod) => (
        <Card key={mod.id} className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">{mod.titleFr} / {mod.titleEn}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mod.lessons.map((l) => (
                <li key={l.id}>• {l.titleFr} ({l.contentType})</li>
              ))}
            </ul>
            <form action={addLesson.bind(null, mod.id, id)} className="mt-4 grid gap-2 sm:grid-cols-2">
              <Input name="titleFr" placeholder={ta("titleFr")} required />
              <Input name="titleEn" placeholder={ta("titleEn")} required />
              <Input name="contentType" placeholder="video | pdf | text" defaultValue="text" required />
              <Input name="order" type="number" defaultValue={mod.lessons.length} required />
              <Input name="durationMin" type="number" placeholder="Duration (min)" className="sm:col-span-2" />
              <Textarea name="bodyFr" placeholder="Body FR" className="sm:col-span-2" />
              <Button type="submit" size="sm">{ta("addLesson")}</Button>
            </form>
          </CardContent>
        </Card>
      ))}

      <form action={addModule.bind(null, id)} className="mt-4 flex flex-wrap gap-2">
        <Input name="titleFr" placeholder={ta("titleFr")} className="max-w-xs" required />
        <Input name="titleEn" placeholder={ta("titleEn")} className="max-w-xs" required />
        <Input name="order" type="number" defaultValue={course.modules.length} className="w-20" required />
        <Button type="submit" variant="outline">{ta("addModule")}</Button>
      </form>

      <Separator className="my-8" />

      <h2 className="text-xl font-semibold">Exam</h2>
      {course.exams.map((exam) => (
        <p key={exam.id} className="mt-2 text-sm">{exam.titleFr} — {exam.passingScore}%</p>
      ))}
      <form action={addExam.bind(null, id)} className="mt-4 flex flex-wrap gap-2">
        <Input name="titleFr" placeholder={ta("titleFr")} className="max-w-xs" required />
        <Input name="titleEn" placeholder={ta("titleEn")} className="max-w-xs" required />
        <Input name="passingScore" type="number" defaultValue={70} className="w-24" />
        <Button type="submit" variant="outline">Add exam</Button>
      </form>
    </AdminShell>
  );
}
