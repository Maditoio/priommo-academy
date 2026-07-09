import { db } from "@/lib/db";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(
  check: (slug: string) => Promise<boolean>,
  baseTitle: string
): Promise<string> {
  const base = slugify(baseTitle) || "item";
  let slug = base;
  let n = 2;
  while (await check(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function uniqueCourseSlug(titleFr: string, excludeId?: string) {
  return uniqueSlug(async (slug) => {
    const row = await db.course.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return !!row;
  }, titleFr);
}

export async function uniqueCertificationSlug(titleFr: string, excludeId?: string) {
  return uniqueSlug(async (slug) => {
    const row = await db.certification.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return !!row;
  }, titleFr);
}

export async function uniqueLevelSlug(nameFr: string, excludeId?: string) {
  return uniqueSlug(async (slug) => {
    const row = await db.certificationLevel.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return !!row;
  }, nameFr);
}

export async function uniqueCategorySlug(courseId: string, nameFr: string) {
  return uniqueSlug(async (slug) => {
    const row = await db.examCategory.findFirst({ where: { courseId, slug } });
    return !!row;
  }, nameFr);
}
