import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PREFS } from "@/lib/seed";
import type { FinanceSnapshot } from "@/store/useFinanceStore";
import {
  serializeIncome,
  serializeExpense,
  serializeGoal,
  serializeCategory,
  serializePrefs,
  serializeImportProfile,
} from "@/lib/serialize";

// ─────────────────────────────────────────────────────────────────────────────
// Server-side data layer (step 6.3)
//
// `getUserData` is THE single, reusable entry point for loading a user's data.
// It runs on the server (per request), derives the userId from the Better Auth
// session (never from the client), loads every entity scoped to that user, and
// returns a fully serialized `FinanceSnapshot` ready to hydrate the Zustand
// cache. The `(app)` layout calls it once and passes the result to the
// StoreHydrator. Pages never query Prisma directly.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserData(): Promise<FinanceSnapshot> {
  const session = await auth.api.getSession({ headers: await headers() });
  // The proxy already gates the (app) routes; this is defence in depth.
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [incomes, expenses, goals, categories, importProfiles, prefs] = await Promise.all([
    prisma.income.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.expense.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.importProfile.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.userPrefs.findUnique({ where: { userId } }),
  ]);

  const allCategories = categories.map(serializeCategory);

  return {
    incomes: incomes.map(serializeIncome),
    expenses: expenses.map(serializeExpense),
    savingsGoals: goals.map(serializeGoal),
    incomeCategories: allCategories.filter((c) => c.type === "income"),
    expenseCategories: allCategories.filter((c) => c.type === "expense"),
    importProfiles: importProfiles.map(serializeImportProfile),
    prefs: prefs
      ? serializePrefs(prefs)
      : { ...DEFAULT_PREFS, displayName: session.user.name ?? DEFAULT_PREFS.displayName },
  };
}
