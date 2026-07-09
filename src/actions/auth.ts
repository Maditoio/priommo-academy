"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
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

export async function updateUserRole(userId: string, role: "LEARNER" | "ADMIN" | "ORG_ADMIN") {
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}
