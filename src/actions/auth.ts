"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { registerSchema, profileSchema } from "@/lib/validation";
import { processAvatarUpload } from "@/lib/avatar";
import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";

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
  });

  if (!parsed.success) {
    adminRedirect(`/${locale}/profile`, "Invalid profile data", "error");
  }

  const removePhoto = formData.get("removePhoto") === "true";
  const photoFile = formData.get("photo");

  let imageUrl: string | null | undefined;
  try {
    if (removePhoto) {
      imageUrl = null;
    } else if (photoFile instanceof File) {
      imageUrl = await processAvatarUpload(photoFile);
    }
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "FILE_TOO_LARGE") {
      adminRedirect(`/${locale}/profile`, "Image must be under 2 MB", "error");
    }
    adminRedirect(`/${locale}/profile`, "Please upload a JPG, PNG, or WebP image", "error");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data!.name,
      phone: parsed.data!.phone || null,
      ...(imageUrl !== undefined ? { imageUrl } : {}),
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
