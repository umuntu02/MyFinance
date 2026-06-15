"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { serializeExpense } from "@/lib/serialize";
import type { Expense } from "@/types";
import { requireUserId } from "./_session";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

const expenseInput = z.object({
  date: dateString,
  description: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  amount: z.number().finite().nonnegative(),
  status: z.enum(["Paid", "Pending"]),
});

export type ExpenseInput = z.infer<typeof expenseInput>;

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const userId = await requireUserId();
  const data = expenseInput.parse(input);

  const row = await prisma.expense.create({
    data: {
      userId,
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      amount: data.amount,
      status: data.status,
    },
  });
  return serializeExpense(row);
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<Expense> {
  const userId = await requireUserId();
  const data = expenseInput.parse(input);

  const result = await prisma.expense.updateMany({
    where: { id, userId },
    data: {
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      amount: data.amount,
      status: data.status,
    },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");

  const row = await prisma.expense.findFirstOrThrow({ where: { id, userId } });
  return serializeExpense(row);
}

export async function deleteExpense(id: string): Promise<{ ok: true }> {
  const userId = await requireUserId();
  await prisma.expense.deleteMany({ where: { id, userId } });
  return { ok: true };
}
