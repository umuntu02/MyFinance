import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Income, Expense, SavingsGoal, UserPrefs } from "@/types";
import { SEED_INCOMES, SEED_EXPENSES, SEED_GOALS, DEFAULT_PREFS } from "@/lib/seed";

type FinanceStore = {
  incomes: Income[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  prefs: UserPrefs;

  // Income CRUD
  addIncome: (income: Omit<Income, "id">) => void;
  updateIncome: (id: string, updates: Partial<Omit<Income, "id">>) => void;
  deleteIncome: (id: string) => void;

  // Expense CRUD
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, "id">>) => void;
  deleteExpense: (id: string) => void;

  // Savings goals CRUD
  addGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateGoal: (id: string, updates: Partial<Omit<SavingsGoal, "id">>) => void;
  deleteGoal: (id: string) => void;

  // Prefs
  updatePrefs: (updates: Partial<UserPrefs>) => void;

  // Reset
  resetToSeed: () => void;
};

const uid = () => crypto.randomUUID();

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      incomes: SEED_INCOMES,
      expenses: SEED_EXPENSES,
      savingsGoals: SEED_GOALS,
      prefs: DEFAULT_PREFS,

      addIncome: (income) =>
        set((s) => ({ incomes: [{ ...income, id: uid() }, ...s.incomes] })),
      updateIncome: (id, updates) =>
        set((s) => ({
          incomes: s.incomes.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteIncome: (id) =>
        set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) })),

      addExpense: (expense) =>
        set((s) => ({ expenses: [{ ...expense, id: uid() }, ...s.expenses] })),
      updateExpense: (id, updates) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      addGoal: (goal) =>
        set((s) => ({ savingsGoals: [{ ...goal, id: uid() }, ...s.savingsGoals] })),
      updateGoal: (id, updates) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      deleteGoal: (id) =>
        set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) })),

      updatePrefs: (updates) =>
        set((s) => ({ prefs: { ...s.prefs, ...updates } })),

      resetToSeed: () =>
        set({
          incomes: SEED_INCOMES,
          expenses: SEED_EXPENSES,
          savingsGoals: SEED_GOALS,
          prefs: DEFAULT_PREFS,
        }),
    }),
    { name: "myfinance" }
  )
);
