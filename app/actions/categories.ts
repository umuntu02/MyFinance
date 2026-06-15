"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { CategoryType } from "@/generated/client";
import { serializeCategory } from "@/lib/serialize";
import type { Category } from "@/types";
import { requireUserId } from "./_session";

const categoryInput = z.object({
  name: z.string().trim().min(1).max(60),
  icon: z.string().trim().min(1).max(60),
  type: z.enum(["income", "expense"]),
});

export type CategoryInput = z.infer<typeof categoryInput>;

export async function createCategory(input: CategoryInput): Promise<Category> {
  const userId = await requireUserId();
  const data = categoryInput.parse(input);

  // Reject duplicates per the @@unique([userId, type, name]) constraint.
  const existing = await prisma.category.findFirst({
    where: { userId, type: data.type as CategoryType, name: data.name },
  });
  if (existing) throw new Error("DUPLICATE");

  const row = await prisma.category.create({
    data: {
      userId,
      name: data.name,
      icon: data.icon,
      type: data.type as CategoryType,
      isDefault: false,
    },
  });
  return serializeCategory(row);
}

export async function deleteCategory(id: string): Promise<{ ok: true }> {
  const userId = await requireUserId();
  // Only the owner's category is touched; existing transactions keep their
  // category label (a plain string), so removing a category never orphans data.
  await prisma.category.deleteMany({ where: { id, userId } });
  return { ok: true };
}
