import type { ElementType } from "react";

export type Language = "en" | "fr" | "es" | "it" | "zh" | "ja" | "hi" | "sw" | "ki" ;
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "INR" | "KES" | "UGX" | "TZS" | "RWF" | "BIF" | "SSP" | "GHS" | "XAF" | "XOF" | "XPF";

// Category names. The listed values are the per-user defaults (seeded at
// sign-up); `(string & {})` keeps autocompletion for them while allowing any
// user-created category name. This is why selectors.ts compiles untouched even
// though categories are now user-defined strings loaded from the database.
export type IncomeCategoryName =
  | "Salary"
  | "Freelance"
  | "Investment"
  | "Bonus"
  | "Other"
  | (string & {});

export type ExpenseCategoryName =
  | "Housing"
  | "Food & Dining"
  | "Transport"
  | "Utilities"
  | "Entertainment"
  | "Healthcare"
  | "Shopping"
  | "Other"
  | (string & {});

// A user-owned category row (income or expense), loaded from the database.
export type CategoryKind = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  icon: string; // lucide icon name (string, serialisable)
  type: CategoryKind;
  isDefault: boolean;
};

export type Income = {
  id: string;
  date: string; // "YYYY-MM-DD"
  source: string;
  category: IncomeCategoryName;
  amount: number;
  notes?: string;
};

export type Expense = {
  id: string;
  date: string; // "YYYY-MM-DD"
  description: string;
  category: ExpenseCategoryName;
  amount: number;
  status: "Paid" | "Pending";
};

export type SavingsGoal = {
  id: string;
  name: string;
  icon: string; // lucide icon name (string, serialisable)
  saved: number;
  target: number;
  targetDate: string; // "YYYY-MM-DD"
};

// Agrégats calculés par selectors.ts — jamais stockés dans le store
export type IncomeCategory = {
  id: string;
  name: IncomeCategoryName;
  icon: string;
  total: number;
  recordCount: number;
};

export type ExpenseCategory = {
  id: string;
  name: ExpenseCategoryName;
  icon: string;
  total: number;
  recordCount: number;
};

export type UserPrefs = {
  currency: Currency;
  language: Language;
  theme: "light" | "dark" | "system";
  logoUrl?: string;
  avatarUrl?: string;
  displayName: string;
  monthlyBudget: number;
};

export type MonthlyBreakdown = {
  month: string;    // "Oct 2025" — label d'affichage
  yearMonth: string; // "2025-10" — clé de tri
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
  status: "Positive" | "Negative";
};

export type ChartDataPoint = {
  month: string;
  income: number;
  expenses: number;
};

// Navigation
export type NavItem = {
  title: string;
  href: string;
  icon: ElementType;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};
