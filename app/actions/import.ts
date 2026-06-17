"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserData } from "@/lib/data";
import type { FinanceSnapshot } from "@/store/useFinanceStore";
import { requireUserId } from "./_session";

// ─────────────────────────────────────────────────────────────────────────────
// Import insertion (generic import feature).
//
// Receives the rows the user reviewed/checked in the preview — already parsed by
// the generic engine to a uniform shape, regardless of the original bank file
// format. Validates with zod, splits into incomes/expenses and writes them in a
// SINGLE transaction, strictly scoped to the session userId (never trusts a
// client-supplied id). Returns a fresh snapshot so the cache re-hydrates.
// ─────────────────────────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

const importRow = z.object({
  date: dateString,
  amount: z.number().finite().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
});

export type ImportRowInput = z.infer<typeof importRow>;

const MAX_ROWS = 5000;

export async function importTransactions(
  rows: ImportRowInput[],
): Promise<FinanceSnapshot> {
  const userId = await requireUserId();

  // Bulk import must be tolerant: normalise + clamp each row (labels from
  // concatenated bank columns routinely exceed the manual-entry cap) and skip
  // anything malformed, so one bad/over-long row never fails the whole batch.
  const valid: ImportRowInput[] = [];
  for (const raw of Array.isArray(rows) ? rows : []) {
    const normalised = {
      date: typeof raw?.date === "string" ? raw.date : "",
      amount: typeof raw?.amount === "number" ? raw.amount : NaN,
      type: raw?.type,
      description: String(raw?.description ?? "").trim().slice(0, 200) || "—",
      category: String(raw?.category ?? "").trim().slice(0, 100) || "Other",
    };
    const parsed = importRow.safeParse(normalised);
    if (parsed.success) valid.push(parsed.data);
    if (valid.length >= MAX_ROWS) break;
  }
  if (valid.length === 0) throw new Error("NO_VALID_ROWS");

  const incomes = valid
    .filter((r) => r.type === "income")
    .map((r) => ({
      userId,
      date: new Date(r.date),
      source: r.description,
      category: r.category,
      amount: r.amount,
      notes: null,
    }));

  const expenses = valid
    .filter((r) => r.type === "expense")
    .map((r) => ({
      userId,
      date: new Date(r.date),
      description: r.description,
      category: r.category,
      amount: r.amount,
      status: "Paid" as const,
    }));

  // Skip empty createMany calls (e.g. a statement of only expenses).
  const ops = [];
  if (incomes.length) ops.push(prisma.income.createMany({ data: incomes }));
  if (expenses.length) ops.push(prisma.expense.createMany({ data: expenses }));
  if (ops.length) await prisma.$transaction(ops);

  return getUserData();
}
