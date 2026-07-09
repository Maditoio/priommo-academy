"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { registerSchema, profileSchema } from "@/lib/validation";
import { adminRedirect } from "@/lib/admin-redirect";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid input" };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email already exists" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: "LEARNER",
    },
  });

  return { success: true };
}

export async function updateProfile(formData: FormData, locale: string) {
  const session = await requireAuth();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || "",
    imageUrl: formData.get("imageUrl") || "",
  });

  if (!parsed.success) {
    adminRedirect(`/${locale}/profile`, "Invalid profile data", "error");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data!.name,
      phone: parsed.data!.phone || null,
      imageUrl: parsed.data!.imageUrl || null,
    },
  });

  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/verify`);
  adminRedirect(`/${locale}/profile`, "Profile updated successfully");
}

export async function updateUserRole(userId: string, role: "LEARNER" | "ADMIN" | "ORG_ADMIN") {
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}
