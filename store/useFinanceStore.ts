import { create } from "zustand";
import type {
  Income,
  Expense,
  SavingsGoal,
  UserPrefs,
  Category,
} from "@/types";
import { DEFAULT_PREFS } from "@/lib/seed";

// ─────────────────────────────────────────────────────────────────────────────
// Finance store (step 6.3) — CLIENT-SIDE CACHE ONLY.
//
// The source of truth is Postgres (per user). The persist middleware and the
// localStorage key "myfinance" are gone: this store is a plain in-memory cache
// hydrated from the server on mount (see components/providers/store-hydrator)
// and kept in sync by the mutators below, which the pages call AFTER a Server
// Action has persisted the change to the database. No component reads/writes
// localStorage directly — that convention now points at the server.
//
// `hydrated` lets pages render skeletons until the server data has landed.
// ─────────────────────────────────────────────────────────────────────────────

export type FinanceSnapshot = {
  incomes: Income[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  prefs: UserPrefs;
};

type FinanceStore = FinanceSnapshot & {
  hydrated: boolean;

  // Replace the whole cache with server data (idempotent).
  hydrate: (data: FinanceSnapshot) => void;

  // Income cache mutators (objects already carry the server-generated id).
  addIncome: (income: Income) => void;
  updateIncome: (id: string, updates: Partial<Omit<Income, "id">>) => void;
  deleteIncome: (id: string) => void;

  // Expense cache mutators
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, "id">>) => void;
  deleteExpense: (id: string) => void;

  // Savings goal cache mutators
  addGoal: (goal: SavingsGoal) => void;
  updateGoal: (id: string, updates: Partial<Omit<SavingsGoal, "id">>) => void;
  deleteGoal: (id: string) => void;

  // Category cache mutators
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  // Prefs cache (server persists; this only reflects the change locally)
  updatePrefs: (updates: Partial<UserPrefs>) => void;
};

export const useFinanceStore = create<FinanceStore>()((set) => ({
  incomes: [],
  expenses: [],
  savingsGoals: [],
  incomeCategories: [],
  expenseCategories: [],
  prefs: DEFAULT_PREFS,
  hydrated: false,

  hydrate: (data) => set({ ...data, hydrated: true }),

  addIncome: (income) =>
    set((s) => ({ incomes: [income, ...s.incomes] })),
  updateIncome: (id, updates) =>
    set((s) => ({
      incomes: s.incomes.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
  deleteIncome: (id) =>
    set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) })),

  addExpense: (expense) =>
    set((s) => ({ expenses: [expense, ...s.expenses] })),
  updateExpense: (id, updates) =>
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  deleteExpense: (id) =>
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

  addGoal: (goal) =>
    set((s) => ({ savingsGoals: [goal, ...s.savingsGoals] })),
  updateGoal: (id, updates) =>
    set((s) => ({
      savingsGoals: s.savingsGoals.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })),
  deleteGoal: (id) =>
    set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) })),

  addCategory: (category) =>
    set((s) =>
      category.type === "income"
        ? { incomeCategories: [...s.incomeCategories, category] }
        : { expenseCategories: [...s.expenseCategories, category] }
    ),
  deleteCategory: (id) =>
    set((s) => ({
      incomeCategories: s.incomeCategories.filter((c) => c.id !== id),
      expenseCategories: s.expenseCategories.filter((c) => c.id !== id),
    })),

  updatePrefs: (updates) =>
    set((s) => ({ prefs: { ...s.prefs, ...updates } })),
}));
