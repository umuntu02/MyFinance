import type { ElementType } from "react";

export type Language = "en" | "fr" | "es" | "it" | "zh" | "ja" | "hi";
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "INR";

export type IncomeCategoryName =
  | "Salary"
  | "Freelance"
  | "Investment"
  | "Bonus"
  | "Other";

export type ExpenseCategoryName =
  | "Housing"
  | "Food & Dining"
  | "Transport"
  | "Utilities"
  | "Entertainment"
  | "Healthcare"
  | "Shopping"
  | "Other";

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
