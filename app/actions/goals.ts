"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { serializeGoal } from "@/lib/serialize";
import type { SavingsGoal } from "@/types";
import { requireUserId } from "./_session";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

const goalInput = z.object({
  name: z.string().trim().min(1).max(200),
  icon: z.string().trim().min(1).max(60),
  saved: z.number().finite().nonnegative(),
  target: z.number().finite().positive(),
  targetDate: dateString,
});

export type GoalInput = z.infer<typeof goalInput>;

export async function createGoal(input: GoalInput): Promise<SavingsGoal> {
  const userId = await requireUserId();
  const data = goalInput.parse(input);

  const row = await prisma.savingsGoal.create({
    data: {
      userId,
      name: data.name,
      icon: data.icon,
      saved: data.saved,
      target: data.target,
      targetDate: new Date(data.targetDate),
    },
  });
  return serializeGoal(row);
}

export async function updateGoal(id: string, input: GoalInput): Promise<SavingsGoal> {
  const userId = await requireUserId();
  const data = goalInput.parse(input);

  const result = await prisma.savingsGoal.updateMany({
    where: { id, userId },
    data: {
      name: data.name,
      icon: data.icon,
      saved: data.saved,
      target: data.target,
      targetDate: new Date(data.targetDate),
    },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");

  const row = await prisma.savingsGoal.findFirstOrThrow({ where: { id, userId } });
  return serializeGoal(row);
}

export async function deleteGoal(id: string): Promise<{ ok: true }> {
  const userId = await requireUserId();
  await prisma.savingsGoal.deleteMany({ where: { id, userId } });
  return { ok: true };
}
