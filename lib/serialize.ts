import type {
  Income,
  Expense,
  SavingsGoal,
  Category,
  UserPrefs,
  ImportProfile,
  ImportMapping,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// API boundary serializers (step 6.3)
//
// Prisma returns `Decimal` for money and `Date` for date-only columns. The app
// types use `number` and "YYYY-MM-DD" strings (the localStorage-era convention
// the selectors/formatters still expect), so every row crossing from the DB to
// the client is normalised here. Pure functions — shared by lib/data.ts (bulk
// load) and the Server Actions (single-row results), so the conversion lives in
// exactly one place.
// ─────────────────────────────────────────────────────────────────────────────

type DecimalLike = number | string | { toNumber(): number };

export function toNumber(value: DecimalLike): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

// `@db.Date` rows come back as a Date at UTC midnight → take the calendar day.
export function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

type IncomeRow = {
  id: string;
  date: Date;
  source: string;
  category: string;
  amount: DecimalLike;
  notes: string | null;
};

type ExpenseRow = {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: DecimalLike;
  status: "Paid" | "Pending";
};

type GoalRow = {
  id: string;
  name: string;
  icon: string;
  saved: DecimalLike;
  target: DecimalLike;
  targetDate: Date;
};

type CategoryRow = {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
  isDefault: boolean;
};

type PrefsRow = {
  currency: string;
  language: string;
  theme: string;
  displayName: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  monthlyBudget: DecimalLike;
};

export function serializeIncome(row: IncomeRow): Income {
  return {
    id: row.id,
    date: toDateString(row.date),
    source: row.source,
    category: row.category,
    amount: toNumber(row.amount),
    notes: row.notes ?? undefined,
  };
}

export function serializeExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    date: toDateString(row.date),
    description: row.description,
    category: row.category,
    amount: toNumber(row.amount),
    status: row.status,
  };
}

export function serializeGoal(row: GoalRow): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    saved: toNumber(row.saved),
    target: toNumber(row.target),
    targetDate: toDateString(row.targetDate),
  };
}

export function serializeCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    type: row.type,
    isDefault: row.isDefault,
  };
}

type ImportProfileRow = {
  id: string;
  name: string;
  config: unknown; // Prisma Json column → already a parsed object
};

export function serializeImportProfile(row: ImportProfileRow): ImportProfile {
  return {
    id: row.id,
    name: row.name,
    // The config shape is validated by zod when written (saveImportProfile), so
    // the stored JSON is trusted to match ImportMapping when read back.
    config: row.config as ImportMapping,
  };
}

export function serializePrefs(row: PrefsRow): UserPrefs {
  return {
    currency: row.currency as UserPrefs["currency"],
    language: row.language as UserPrefs["language"],
    theme: row.theme as UserPrefs["theme"],
    displayName: row.displayName,
    logoUrl: row.logoUrl ?? undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    monthlyBudget: toNumber(row.monthlyBudget),
  };
}
