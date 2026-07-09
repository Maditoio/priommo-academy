import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export const bilingualTextSchema = z.object({
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionFr: z.string().min(1),
  descriptionEn: z.string().min(1),
});

export const courseSchema = bilingualTextSchema.extend({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  level: z.string().min(1),
  price: z.coerce.number().min(0),
  currency: z.string().default("USD"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(false),
});

export const moduleSchema = z.object({
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  order: z.coerce.number().int().min(0),
});

export const lessonSchema = z.object({
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  contentType: z.enum(["video", "pdf", "text"]),
  contentUrl: z.string().optional(),
  bodyFr: z.string().optional(),
  bodyEn: z.string().optional(),
  order: z.coerce.number().int().min(0),
  durationMin: z.coerce.number().int().min(0).optional(),
});

export const certificationSchema = bilingualTextSchema.extend({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  level: z.string().min(1),
  courseId: z.string().optional().nullable(),
});

export const organizationSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  contactEmail: z.string().email(),
  seats: z.coerce.number().int().min(0),
});

export const examSchema = z.object({
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  passingScore: z.coerce.number().int().min(0).max(100).default(70),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
