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

// ─────────────────────────────────────────────────────────────────────────────
// Generic bank-statement import (no per-bank rules).
//
// `ImportMapping` is the user-defined, reusable configuration that drives the
// import engine: which columns are date/amount/label/category, whether amounts
// live in one signed column or split debit/credit columns, and the date & number
// formats. Columns are referenced BY HEADER NAME (not position) so a saved
// profile still resolves correctly when a later file's columns shift order.
// ─────────────────────────────────────────────────────────────────────────────

// Day/Month/Year ordering for textual dates. Excel/serial dates are detected
// automatically and bypass this; "auto" lets the engine pick from the samples.
export type DateFormatId = "auto" | "DMY" | "MDY" | "YMD";

export type DecimalSeparator = "," | ".";
export type ThousandsSeparator = "," | "." | " " | "'" | "none";

// "single": one signed amount column (one sign means expense, the other income).
// "split":  separate debit and credit columns.
export type AmountMode = "single" | "split";

export type ImportMapping = {
  amountMode: AmountMode;
  dateColumn: string | null;
  // single mode
  amountColumn: string | null;
  expenseSign: "negative" | "positive"; // which sign of the signed column is an expense
  // split mode
  debitColumn: string | null;
  creditColumn: string | null;
  // label (one or more columns concatenated) + optional category column
  descriptionColumns: string[];
  categoryColumn: string | null;
  // optional, editable: text removed from every label (case-insensitive) to
  // strip noisy prefixes/markers, e.g. "CARTE 12/03" or "PAIEMENT CB".
  labelCleanup: string;
  // formats (auto-detected, user-adjustable)
  dateFormat: DateFormatId;
  decimalSeparator: DecimalSeparator;
  thousandsSeparator: ThousandsSeparator;
};

// A reusable, user-named mapping (one row in ImportProfile, scoped to the user).
export type ImportProfile = {
  id: string;
  name: string;
  config: ImportMapping;
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
