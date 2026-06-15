"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { serializeIncome } from "@/lib/serialize";
import type { Income } from "@/types";
import { requireUserId } from "./_session";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

const incomeInput = z.object({
  date: dateString,
  source: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  amount: z.number().finite().nonnegative(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type IncomeInput = z.infer<typeof incomeInput>;

export async function createIncome(input: IncomeInput): Promise<Income> {
  const userId = await requireUserId();
  const data = incomeInput.parse(input);

  const row = await prisma.income.create({
    data: {
      userId,
      date: new Date(data.date),
      source: data.source,
      category: data.category,
      amount: data.amount,
      notes: data.notes ?? null,
    },
  });
  return serializeIncome(row);
}

export async function updateIncome(id: string, input: IncomeInput): Promise<Income> {
  const userId = await requireUserId();
  const data = incomeInput.parse(input);

  // Scope by userId so a user can never mutate another user's row.
  const result = await prisma.income.updateMany({
    where: { id, userId },
    data: {
      date: new Date(data.date),
      source: data.source,
      category: data.category,
      amount: data.amount,
      notes: data.notes ?? null,
    },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");

  const row = await prisma.income.findFirstOrThrow({ where: { id, userId } });
  return serializeIncome(row);
}

export async function deleteIncome(id: string): Promise<{ ok: true }> {
  const userId = await requireUserId();
  await prisma.income.deleteMany({ where: { id, userId } });
  return { ok: true };
}
