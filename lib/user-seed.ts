import { prisma } from "@/lib/prisma";
import { CategoryType } from "@/generated/client";
import { SEED_INCOMES, SEED_EXPENSES, SEED_GOALS } from "@/lib/seed";

// ─────────────────────────────────────────────────────────────────────────────
// Per-user seeding (step 6.2)
//
// A brand-new account starts blank: only the default categories + preferences
// are created at sign-up (see `seedDefaultsForUser`, wired into the Better Auth
// `user.create.after` hook). The 18 demo incomes / 98 demo expenses are NOT
// seeded — they are opt-in through the "Load demo data" button in Settings
// (`loadDemoDataForUser`).
// ─────────────────────────────────────────────────────────────────────────────

// Default categories, mirroring the icons used in lib/selectors.ts.
const DEFAULT_INCOME_CATEGORIES: { name: string; icon: string }[] = [
  { name: "Salary", icon: "briefcase" },
  { name: "Freelance", icon: "code-2" },
  { name: "Investment", icon: "trending-up" },
  { name: "Bonus", icon: "gift" },
  { name: "Other", icon: "circle-dot" },
];

const DEFAULT_EXPENSE_CATEGORIES: { name: string; icon: string }[] = [
  { name: "Housing", icon: "home" },
  { name: "Food & Dining", icon: "utensils" },
  { name: "Transport", icon: "car" },
  { name: "Utilities", icon: "zap" },
  { name: "Entertainment", icon: "tv-2" },
  { name: "Healthcare", icon: "heart-pulse" },
  { name: "Shopping", icon: "shopping-bag" },
  { name: "Other", icon: "circle-dot" },
];

/**
 * Seed the starter data for a newly created account: default income/expense
 * categories (marked `isDefault`) and a default UserPrefs row. Idempotent.
 */
export async function seedDefaultsForUser(userId: string, displayName = "") {
  await prisma.$transaction([
    prisma.category.createMany({
      data: [
        ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
          ...c,
          type: CategoryType.income,
          isDefault: true,
          userId,
        })),
        ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
          ...c,
          type: CategoryType.expense,
          isDefault: true,
          userId,
        })),
      ],
      skipDuplicates: true,
    }),
    prisma.userPrefs.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        currency: "USD",
        language: "en",
        theme: "system",
        displayName,
        monthlyBudget: 3500,
      },
    }),
  ]);
}

/**
 * Inject the lib/seed.ts demo dataset (incomes, expenses, savings goals) for the
 * current user. Existing financial records for that user are cleared first so the
 * action is idempotent (re-clicking re-loads a clean demo set).
 */
export async function loadDemoDataForUser(userId: string) {
  await prisma.$transaction([
    prisma.income.deleteMany({ where: { userId } }),
    prisma.expense.deleteMany({ where: { userId } }),
    prisma.savingsGoal.deleteMany({ where: { userId } }),
    prisma.income.createMany({
      data: SEED_INCOMES.map((i) => ({
        userId,
        date: new Date(i.date),
        source: i.source,
        category: i.category,
        amount: i.amount,
        notes: i.notes ?? null,
      })),
    }),
    prisma.expense.createMany({
      data: SEED_EXPENSES.map((e) => ({
        userId,
        date: new Date(e.date),
        description: e.description,
        category: e.category,
        amount: e.amount,
        status: e.status,
      })),
    }),
    prisma.savingsGoal.createMany({
      data: SEED_GOALS.map((g) => ({
        userId,
        name: g.name,
        icon: g.icon,
        saved: g.saved,
        target: g.target,
        targetDate: new Date(g.targetDate),
      })),
    }),
  ]);
}
